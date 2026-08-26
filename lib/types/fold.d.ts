/**
 * Pure fold of `wait/change` Session events into the GoodJob waits view.
 *
 * The fold mirrors the owning `@deepseek-ai/dsh-wait` replay semantics in a
 * read-only form: it never mutates intent and treats unknown versions as
 * no-ops, so an older viewer stays inert against a newer log. One event
 * belongs to exactly one Agent's Session, so the fold needs no session key.
 * @module dsh-goodjob/fold
 */
import type { GoodJobWaitView, JsonValue } from './types.ts';
/** Canonical provider condition as recorded at creation. */
export interface WaitConditionRecord {
    provider: string;
    input: JsonValue;
}
/** Versioned durable wait mutation as recorded by `@deepseek-ai/dsh-wait`. */
export type WaitChangeEvent = {
    version: 1;
    operation: 'create';
    wait: {
        id: string;
        expression: {
            mode: 'any' | 'all';
            conditions: readonly WaitConditionRecord[];
        };
        createdAt: number;
    };
} | {
    version: 1;
    operation: 'resolve';
    id: string;
    result: {
        index: number;
        provider: string;
        value: JsonValue;
        settledAt: number;
    };
} | {
    version: 1;
    operation: 'cancel';
    id: string;
    cancelledAt: number;
} | {
    version: 1;
    operation: 'dispatch';
    ids: readonly string[];
    dispatchedAt: number;
};
/** Minimal structural shape of the projection value used by the fold. */
export interface WaitsProjectionLike {
    /** Waits in creation order. */
    readonly waits?: readonly GoodJobWaitView[];
}
/** Stable empty list so an idle session keeps one array identity. */
export declare const NO_WAITS: readonly GoodJobWaitView[];
/** Narrow one raw session-log record to the `wait/change` payload. */
export declare function isWaitChange(value: unknown): value is {
    type: 'wait/change';
} & WaitChangeEvent;
/**
 * Apply one committed event to the previous waits view.
 * @param state - previous client value (null before the first wait).
 * @param event - one raw committed Session event.
 * @returns the next value; the same reference when the event is not a wait mutation.
 */
export declare function applyWaitEvent(state: WaitsProjectionLike | null | undefined, event: unknown): WaitsProjectionLike | null | undefined;
