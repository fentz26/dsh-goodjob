/** What the delta is relative to. */
export type DeltaAnchor = {
    kind: 'first-visit';
} | {
    kind: 'last-visit';
    at: number;
};
/** One derived operational change. */
export interface DeltaItem {
    /** Stable identity: deduplicates one underlying change. */
    id: string;
    /** Presentation category for filtering. */
    entityKind: 'job' | 'wait' | 'job-group' | 'goal' | 'schedule' | 'message';
    entityId: string;
    sessionId?: string;
    /** Factual change phrase — never a heuristic. */
    change: string;
    severity: 'info' | 'attention' | 'failure';
    /** Authoritative event timestamp when the owning capability recorded one. */
    authoritativeAt?: number;
}
/** Structural input face (test-friendly; the workspace domain satisfies it). */
export interface DeltaDomainLike {
    rootSessionId: string;
    jobs: readonly {
        sessionId: string;
        job: {
            id: string | number;
            label: string;
            status: string;
            startedAt: number;
            finishedAt?: number;
        };
    }[];
    waits: readonly {
        id: string;
        createdAt: number;
        mode: string;
    }[];
    groups: readonly {
        id: string | number;
        label: string;
        createdAt: number;
    }[];
    goal: {
        phase?: string;
        objective?: string;
        updatedAt?: number;
        blockedReason?: {
            message: string;
        };
    } | null;
    schedules: readonly {
        id: string;
        kind: 'after' | 'at' | 'every';
        scheduledAt?: string;
        dispatched: boolean;
    }[];
    messages: readonly {
        id: string;
        senderId: string;
        senderName: string;
        targetId: string;
        delivery: string;
        queuedAt: number;
    }[];
}
export interface OperationsDelta {
    since: DeltaAnchor;
    generatedAt: number;
    items: readonly DeltaItem[];
}
/**
 * Derive every deterministic change since the anchor.
 * @param domain - projected slices carrying authoritative timestamps.
 * @param anchor - reference instant (`first-visit` yields an empty delta).
 * @param nowMs - current clock for boundary comparisons only.
 */
export declare function deriveOperationsDelta(domain: DeltaDomainLike, anchor: DeltaAnchor, nowMs: number): OperationsDelta;
