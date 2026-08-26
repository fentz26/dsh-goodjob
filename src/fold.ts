/**
 * Pure fold of `wait/change` Session events into the GoodJob waits view.
 *
 * The fold mirrors the owning `@deepseek-ai/dsh-wait` replay semantics in a
 * read-only form: it never mutates intent and treats unknown versions as
 * no-ops, so an older viewer stays inert against a newer log. One event
 * belongs to exactly one Agent's Session, so the fold needs no session key.
 * @module dsh-goodjob/fold
 */
import type { GoodJobWaitView, JsonValue, WaitLeafView, WaitStatus } from './types.ts'

/** Canonical provider condition as recorded at creation. */
export interface WaitConditionRecord {
  provider: string
  input: JsonValue
}

/** Versioned durable wait mutation as recorded by `@deepseek-ai/dsh-wait`. */
export type WaitChangeEvent =
  | { version: 1; operation: 'create'; wait: { id: string; expression: { mode: 'any' | 'all'; conditions: readonly WaitConditionRecord[] }; createdAt: number } }
  | { version: 1; operation: 'resolve'; id: string; result: { index: number; provider: string; value: JsonValue; settledAt: number } }
  | { version: 1; operation: 'cancel'; id: string; cancelledAt: number }
  | { version: 1; operation: 'dispatch'; ids: readonly string[]; dispatchedAt: number }

/** Minimal structural shape of the projection value used by the fold. */
export interface WaitsProjectionLike {
  /** Waits in creation order. */
  readonly waits?: readonly GoodJobWaitView[]
}

/** Stable empty list so an idle session keeps one array identity. */
export const NO_WAITS: readonly GoodJobWaitView[] = []

/** Narrow one raw session-log record to the `wait/change` payload. */
export function isWaitChange(value: unknown): value is { type: 'wait/change' } & WaitChangeEvent {
  return (
    typeof value === 'object' && value !== null
    && (value as { type?: unknown }).type === 'wait/change'
  )
}

/**
 * Apply one committed event to the previous waits view.
 * @param state - previous client value (null before the first wait).
 * @param event - one raw committed Session event.
 * @returns the next value; the same reference when the event is not a wait mutation.
 */
export function applyWaitEvent(
  state: WaitsProjectionLike | null | undefined,
  event: unknown,
): WaitsProjectionLike | null | undefined {
  if (!isWaitChange(event) || event.version !== 1) return state
  switch (event.operation) {
    case 'create': {
      const leaves: WaitLeafView[] = event.wait.expression.conditions.map((condition, index) => ({
        index,
        provider: condition.provider,
        input: condition.input,
      }))
      const view: GoodJobWaitView = {
        id: event.wait.id,
        sessionId: '',
        createdAt: event.wait.createdAt,
        mode: event.wait.expression.mode,
        leaves,
        status: 'pending',
      }
      return {
        waits: [...(state?.waits ?? NO_WAITS).filter(existing => existing.id !== view.id), view],
      }
    }
    case 'resolve': {
      return mapWait(state, event.id, (wait) => {
        if (wait.status === 'cancelled') return wait
        const leaves = wait.leaves.map(leaf => leaf.index === event.result.index && leaf.result === undefined
          ? { ...leaf, result: event.result.value }
          : leaf)
        // `any` admits its winner immediately; `all` turns ready when the last
        // missing result arrives.
        const complete = wait.mode === 'any'
          ? true
          : leaves.every(leaf => leaf.result !== undefined)
        const status: WaitStatus = complete ? 'ready' : wait.status
        const winnerIndex = wait.mode === 'any' ? (wait.winnerIndex ?? event.result.index) : undefined
        return { ...wait, leaves, status, winnerIndex }
      })
    }
    case 'cancel': {
      return mapWait(state, event.id, wait => wait.status === 'dispatched'
        ? wait
        : { ...wait, status: 'cancelled' })
    }
    case 'dispatch': {
      const ids = new Set(event.ids)
      let changed = false
      const waits = (state?.waits ?? NO_WAITS).map((wait) => {
        if (!ids.has(wait.id)) return wait
        changed = true
        return { ...wait, status: 'dispatched' as const }
      })
      return changed ? { waits } : state
    }
  }
}

/** Rewrite one wait by id, keeping references for untouched members. */
function mapWait(
  state: WaitsProjectionLike | null | undefined,
  id: string,
  rewrite: (wait: GoodJobWaitView) => GoodJobWaitView,
): WaitsProjectionLike | null | undefined {
  const waits = state?.waits ?? NO_WAITS
  let changed = false
  const next = waits.map((wait) => {
    if (wait.id !== id) return wait
    changed = true
    return rewrite(wait)
  })
  return changed ? { waits: next } : state
}
