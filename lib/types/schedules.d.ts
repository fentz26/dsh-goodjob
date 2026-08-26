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
import type { GoodJobScheduleRecordView, GoodJobSchedulesProjection } from './types.ts';
/** Stable empty projection used before any schedule exists. */
export declare const NO_SCHEDULES: GoodJobSchedulesProjection;
/**
 * Read-only delivery boundary upstream commits to for v1 records.
 */
export declare const SCHEDULE_DELIVERY_MODE: 'session-local';
/** Narrow one raw session-log record to a `schedule/change` mutation. */
export declare function isScheduleChange(value: unknown): value is {
    type: 'schedule/change';
} & Record<string, unknown>;
/**
 * Apply one committed session event to the previous schedules value.
 * @param state - previous value (null before anything folded).
 * @param event - one raw committed Session event.
 * @returns the next value; an equal reference when nothing changed.
 */
export declare function applyScheduleEvent(state: GoodJobSchedulesProjection | null | undefined, event: unknown): GoodJobSchedulesProjection | null;
/**
 * Derive one active record's current delivery state from its explicit target
 * and the caller's clock — exactly what upstream's ScheduleView reports.
 * @param item - folded record (`at` or `every`; `after` has no dispatch yet).
 * @param nowMs - current epoch milliseconds used for comparison only.
 * @returns `'overdue'` when the absolute target already passed, else `'scheduled'`.
 */
export declare function deliveryState(item: GoodJobScheduleRecordView, nowMs: number): 'scheduled' | 'overdue' | 'unset';
