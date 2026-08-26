/**
 * Pure fold of durable `tool-workflow/*` Session events into a workflows view.
 *
 * These events are written by `@deepseek-ai/dsh-tool-workflow` into its
 * calling parent Session. GoodJob treats them structurally — no dependency on
 * the experimental package at fold time, no interpretation of unknown event
 * types, and timestamps never invented (the events carry none).
 *
 * The fold is deterministic: applying a log in order and applying it
 * incrementally produce identical values, so restart replay equals live
 * observation.
 * @module dsh-goodjob/workflows
 */
import type {
  GoodJobWorkflowMemberView,
  GoodJobWorkflowRunView,
  GoodJobWorkflowsProjection,
} from './types.ts'

/** Member outcome vocabulary as authored by the upstream tool. */
export type WorkflowAgentOutcome = 'completed' | 'failed' | 'cancelled'

/** Stable empty projection used before any run starts. */
export const NO_WORKFLOWS: GoodJobWorkflowsProjection = { runs: [] }

function record(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  return value as Record<string, unknown>
}

/** Narrow one raw session-log record to a workflow run start. */
export function isRunStart(value: unknown): value is { type: 'tool-workflow/run-start'; runId: string; name: string } {
  return record(value)?.type === 'tool-workflow/run-start'
    && typeof (value as { runId?: unknown }).runId === 'string'
    && typeof (value as { name?: unknown }).name === 'string'
}

/** Narrow one raw session-log record to a workflow member publish. */
export function isAgentStart(
  value: unknown,
): value is { type: 'tool-workflow/agent-start'; runId: string; seq: number; label: string; phase?: string; childId: string } {
  const item = record(value)
  if (item?.type !== 'tool-workflow/agent-start') return false
  return typeof item.runId === 'string'
    && typeof item.seq === 'number' && Number.isSafeInteger(item.seq)
    && typeof item.label === 'string'
    && (item.phase === undefined || typeof item.phase === 'string')
    && typeof item.childId === 'string'
}

/** Narrow one raw session-log record to a member settlement. */
export function isAgentEnd(
  value: unknown,
): value is { type: 'tool-workflow/agent-end'; runId: string; seq: number; outcome: WorkflowAgentOutcome } {
  const item = record(value)
  if (item?.type !== 'tool-workflow/agent-end') return false
  return typeof item.runId === 'string'
    && typeof item.seq === 'number' && Number.isSafeInteger(item.seq)
    && (item.outcome === 'completed' || item.outcome === 'failed' || item.outcome === 'cancelled')
}

/** Narrow one raw session-log record to a terminal run event. */
export function isRunEnd(
  value: unknown,
): value is { type: 'tool-workflow/run-end'; runId: string; stopReason: GoodJobWorkflowRunView['stopReason'] & {} } {
  const item = record(value)
  if (item?.type !== 'tool-workflow/run-end') return false
  return typeof item.runId === 'string'
    && (item.stopReason === 'completed' || item.stopReason === 'cancelled' || item.stopReason === 'error')
}

/** Read-only structural walk of the current runs list. */
interface RunState {
  readonly runs: readonly GoodJobWorkflowRunView[]
}

/**
 * Apply one committed session event to the previous workflows value.
 * @param state - previous value (null before anything folded).
 * @param event - one raw committed Session event.
 * @returns the next value; an equal reference when nothing changed.
 */
export function applyWorkflowEvent(
  state: GoodJobWorkflowsProjection | null | undefined,
  event: unknown,
): GoodJobWorkflowsProjection | null {
  const previous: RunState = state ?? NO_WORKFLOWS
  if (isRunStart(event)) {
    if (previous.runs.some(run => run.id === event.runId)) return state ?? null
    const run: GoodJobWorkflowRunView = { id: event.runId, name: event.name, state: 'running', members: [] }
    return { runs: [...previous.runs, run] }
  }
  if (isAgentStart(event)) {
    return takeMapped(state, mapRuns(previous, event.runId, run => {
      if (run.members.some(member => member.seq === event.seq)) return run
      const member: GoodJobWorkflowMemberView = {
        seq: event.seq,
        label: event.label,
        phase: event.phase,
        childId: event.childId,
      }
      return { ...run, members: [...run.members, member] }
    }))
  }
  if (isAgentEnd(event)) {
    return takeMapped(state, mapRuns(previous, event.runId, run => {
      let changed = false
      const members = run.members.map(member =>
        member.seq === event.seq && member.outcome !== event.outcome
          ? (changed = true, { ...member, outcome: event.outcome })
          : member)
      return changed ? { ...run, members } : run
    }))
  }
  if (isRunEnd(event)) {
    return takeMapped(state, mapRuns(previous, event.runId, run =>
      run.state === 'running' ? { ...run, state: event.stopReason!, stopReason: event.stopReason } : run))
  }
  // Unknown or unrelated event types are inert by construction.
  return state ?? null
}

function takeMapped(
  state: GoodJobWorkflowsProjection | null | undefined,
  mapped: { changed: boolean; projection: GoodJobWorkflowsProjection },
): GoodJobWorkflowsProjection | null {
  return mapped.changed ? mapped.projection : state ?? null
}

/** Apply one mutation to the matching run, reporting whether anything changed. */
function mapRuns(
  previous: RunState,
  runId: string,
  mutate: (run: GoodJobWorkflowRunView) => GoodJobWorkflowRunView,
): { changed: boolean; projection: GoodJobWorkflowsProjection } {
  let changed = false
  const runs = previous.runs.map(run => {
    if (run.id !== runId) return run
    const next = mutate(run)
    if (next !== run) changed = true
    return next
  })
  return changed ? { changed: true, projection: { runs } } : { changed: false, projection: { runs: previous.runs } }
}
