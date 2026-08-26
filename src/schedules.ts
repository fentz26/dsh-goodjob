/**
 * Pure fold of durable `schedule/change` Session events into a schedules view.
 *
 * The events are written by `@deepseek-ai/dsh-schedule`. The fold is a strict
 * structural v1 reader: unknown operations, future versions, and malformed
 * payloads are inert. Delivery state is never stored — upstream derives it
 * from the record plus wall clock at read time, and so does GoodJob, via the
 * explicit absolute target in {@link deliveryState}.
 * @module dsh-goodjob/schedules
 */
import type { GoodJobScheduleRecordView, GoodJobSchedulesProjection } from './types.ts'

/** Stable empty projection used before any schedule exists. */
export const NO_SCHEDULES: GoodJobSchedulesProjection = { schedules: [] }

/**
 * Read-only delivery boundary upstream commits to for v1 records.
 */
export const SCHEDULE_DELIVERY_MODE = 'session-local' as const

function record(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  return value as Record<string, unknown>
}

function isRfc3339Utc(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
    && !Number.isNaN(Date.parse(value))
}

function parseRecord(kind: string, item: Record<string, unknown>): GoodJobScheduleRecordView | undefined {
  if (typeof item.id !== 'string' || typeof item.prompt !== 'string') return undefined
  if (kind === 'after') {
    if (typeof item.delayedSeconds !== 'number' || !Number.isSafeInteger(item.delayedSeconds)) return undefined
    return {
      id: item.id,
      kind: 'after',
      prompt: item.prompt,
      delayedSeconds: item.delayedSeconds,
      dispatched: false,
    }
  }
  if (kind === 'at') {
    if (!isRfc3339Utc(item.scheduledAt)) return undefined
    return { id: item.id, kind: 'at', prompt: item.prompt, scheduledAt: item.scheduledAt, dispatched: false }
  }
  if (kind === 'every') {
    if (typeof item.everySeconds !== 'number' || !Number.isSafeInteger(item.everySeconds)) return undefined
    if (!isRfc3339Utc(item.scheduledAt)) return undefined
    return {
      id: item.id,
      kind: 'every',
      prompt: item.prompt,
      scheduledAt: item.scheduledAt,
      everySeconds: item.everySeconds,
      dispatched: false,
    }
  }
  return undefined
}

/** Narrow one raw session-log record to a `schedule/change` mutation. */
export function isScheduleChange(
  value: unknown,
): value is { type: 'schedule/change' } & Record<string, unknown> {
  return record(value)?.type === 'schedule/change'
    && (value as { version?: unknown }).version === 1
}

/** Structural face used internally when matching one stored record. */
function sameRecord(a: GoodJobScheduleRecordView, b: GoodJobScheduleRecordView): boolean {
  return a.kind === b.kind && a.prompt === b.prompt
    && a.scheduledAt === b.scheduledAt
    && a.delayedSeconds === b.delayedSeconds
    && a.everySeconds === b.everySeconds
}

/**
 * Apply one committed session event to the previous schedules value.
 * @param state - previous value (null before anything folded).
 * @param event - one raw committed Session event.
 * @returns the next value; an equal reference when nothing changed.
 */
export function applyScheduleEvent(
  state: GoodJobSchedulesProjection | null | undefined,
  event: unknown,
): GoodJobSchedulesProjection | null {
  if (!isScheduleChange(event)) return state ?? null
  const previous = state ?? NO_SCHEDULES
  let result: GoodJobSchedulesProjection = previous
  switch ((event as { operation?: unknown }).operation) {
    case 'create': {
      const payload = record((event as { schedule?: unknown }).schedule)
      if (payload === undefined) return previous
      const parsed = parseRecord(String(payload.kind), payload)
      if (parsed === undefined) return previous
      if (previous.schedules.some(item => item.id === parsed.id || sameRecord(item, parsed))) return previous
      result = { schedules: [...previous.schedules, parsed] }
      break
    }
    case 'delete': {
      const id = (event as { id?: unknown }).id
      if (typeof id !== 'string') return previous
      const schedules = previous.schedules.filter(item => item.id !== id)
      result = { schedules }
      break
    }
    case 'dispatch': {
      const id = (event as { id?: unknown }).id
      if (typeof id !== 'string') return previous
      // A fixed-rate dispatch advances directly past missed occurrences;
      // the authoritative accepted-at instant arrives alongside it.
      const acceptedAt = (event as { acceptedAt?: unknown }).acceptedAt
      const schedules = previous.schedules.map(item => {
        if (item.id !== id || item.dispatched) return item
        if (item.kind === 'every' && isRfc3339Utc(acceptedAt)) {
          return { ...item, scheduledAt: nextEveryTarget(item.scheduledAt!, item.everySeconds!, acceptedAt) }
        }
        return { ...item, dispatched: true }
      })
      result = { schedules }
      break
    }
    default:
      return previous
  }
  // Reference stability: equal values keep the caller's identity.
  return sameProjection(result, previous) ? (state ?? null) : result
}

function sameProjection(a: GoodJobSchedulesProjection, b: GoodJobSchedulesProjection): boolean {
  return a === b || (a.schedules.length === b.schedules.length && a.schedules.every((item, index) => {
    const other = b.schedules[index]!
    return item.id === other.id && item.kind === other.kind && item.prompt === other.prompt
      && item.dispatched === other.dispatched && item.scheduledAt === other.scheduledAt
      && item.delayedSeconds === other.delayedSeconds && item.everySeconds === other.everySeconds
  }))
}

/** RFC 3339 UTC round-trip helper for absolute targets. */
function parseInstant(value: string): number {
  return Date.parse(value)
}

function formatInstant(ms: number): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/** Next anchor-aligned occurrence after an accepted instant. */
function nextEveryTarget(scheduledAt: string, everySeconds: number, acceptedAt: string): string {
  const anchor = parseInstant(scheduledAt)
  const now = parseInstant(acceptedAt)
  const step = Math.max(1, everySeconds) * 1000
  const elapsed = now - anchor
  const hops = Math.max(1, Math.ceil(elapsed / step))
  return formatInstant(anchor + hops * step)
}

/**
 * Derive one active record's current delivery state from its explicit target
 * and the caller's clock — exactly what upstream's ScheduleView reports.
 * @param item - folded record (`at` or `every`; `after` has no dispatch yet).
 * @param nowMs - current epoch milliseconds used for comparison only.
 * @returns `'overdue'` when the absolute target already passed, else `'scheduled'`.
 */
export function deliveryState(item: GoodJobScheduleRecordView, nowMs: number): 'scheduled' | 'overdue' | 'unset' {
  if (item.kind === 'after' || item.dispatched || item.scheduledAt === undefined) return 'unset'
  return parseInstant(item.scheduledAt) <= nowMs ? 'overdue' : 'scheduled'
}
