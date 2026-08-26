import type { ZodType } from 'zod';
/** One wait leaf as the model created it (canonical JSON input). */
export type JsonValue = string | number | boolean | null | readonly JsonValue[] | {
    readonly [key: string]: JsonValue;
};
/** Wait expression mode. */
export type WaitMode = 'any' | 'all';
/** Lifecycle of one durable wait intent, folded from `wait/change`. */
export type WaitStatus = 'pending' | 'ready' | 'dispatched' | 'cancelled';
/** One settled or pending leaf inside a wait expression. */
export interface WaitLeafView {
    /** Zero-based position in the creation-time leaf array. */
    index: number;
    /** Provider name from the leaf input, when it carries one. */
    provider?: string;
    /** Canonical provider input (JSON from the Session log). */
    input?: unknown;
    /** Settlement result, present once the leaf resolved (JSON). */
    result?: unknown;
}
/** Client view of one wait intent. */
export interface GoodJobWaitView {
    /** Durable wait identity from the creating Agent's Session. */
    id: string;
    /** Owning root-Agent session id. */
    sessionId: string;
    /** Creation timestamp (host epoch ms). */
    createdAt: number;
    /** Expression mode. */
    mode: WaitMode;
    /** Leaf views in creation order. */
    leaves: readonly WaitLeafView[];
    /** Winning leaf index for an admitted `any` race. */
    winnerIndex?: number;
    /** Fold lifecycle; `dispatched` means the continuation was admitted. */
    status: WaitStatus;
}
/** The whole client-visible value of the `goodjob/waits` projection key. */
export interface GoodJobWaitsProjection {
    /** Waits for this session in creation order. */
    waits: readonly GoodJobWaitView[];
}
/** The GoodJob key in the shared client projection table. */
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        /** Folded wait intents for the current session. */
        'goodjob/waits': GoodJobWaitsProjection | null;
    }
}
/** Structural face of the session-projection registry GoodJob registers into. */
export interface ProjectionRegistry {
    register(definition: {
        key: 'goodjob/waits';
        stateSchema: ZodType<GoodJobWaitsProjection | null>;
        init(): GoodJobWaitsProjection | null;
        apply(state: GoodJobWaitsProjection | null, event: unknown): GoodJobWaitsProjection | null;
        stateVersion: number;
        wire: {
            viewSchema: ZodType<GoodJobWaitsProjection | null>;
            view(state: GoodJobWaitsProjection | null): GoodJobWaitsProjection | null;
        };
    }): () => void;
}
