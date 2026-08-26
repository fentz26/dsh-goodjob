/**
 * Deterministic attention and blocking derivation.
 *
 * Every item is computed from authoritative projection state that GoodJob
 * already mirrors: goal phase from the upstream `goal` projection, Job
 * statuses from the sessions mirror, schedule delivery state from the durable
 * record plus an explicit clock, and Team task dependencies plus member
 * phases from the Team fold. Nothing here invents state — when a relation or
 * fact is unknown it is omitted rather than estimated.
 *
 * The same blocker never appears twice unless distinct authoritative reasons
 * genuinely exist.
 * @module dsh-goodjob/client/attention
 */
import type { GoodJobScheduleRecordView } from '../types.ts';
/** Where one attention item's navigation should land. */
export type AttentionTarget = {
    kind: 'job';
    sessionId: string;
    jobId: string;
} | {
    kind: 'goal';
} | {
    kind: 'wait';
    waitId: string;
} | {
    kind: 'task';
    taskId: string;
} | {
    kind: 'schedule';
    scheduleId: string;
};
/** One human-attention surface entry. */
export interface AttentionItem {
    /** Stable identity: deduplicates a blocker across sections. */
    id: string;
    severity: 'info' | 'warning' | 'error';
    /** Objective category rendered as a chip. */
    reason: 'blocked' | 'failed' | 'input-required' | 'approval-required' | 'overdue' | 'unavailable';
    explanation: string;
    target: AttentionTarget;
}
/** Minimal structural faces consumed by the derivation (test-friendly). */
export interface AttentionGoalLike {
    id?: string;
    objective?: string;
    phase?: 'active' | 'paused' | 'blocked' | 'complete';
    blockedReason?: {
        code: string;
        message: string;
    };
}
export interface AttentionTaskLike {
    id: string;
    subject: string;
    status: 'pending' | 'in_progress' | 'completed' | 'deleted';
    ownerId?: string;
    blockedBy: readonly string[];
}
/** Inputs to {@link deriveAttention}. Only known facts are passed in. */
export interface AttentionInput {
    goal?: AttentionGoalLike | null;
    jobsBySession: Readonly<Record<string, readonly {
        id: string;
        status: string;
        label?: string;
    }[] | undefined>>;
    tasks: readonly AttentionTaskLike[];
    schedules: readonly GoodJobScheduleRecordView[];
    teamUnavailable: boolean;
    /** Current clock for overdue derivation (epoch ms). */
    nowMs: number;
}
/**
 * Derive every current attention item.
 * @param input - authoritative projection slices.
 * @returns items ordered error → warning → info, then by identity.
 */
export declare function deriveAttention(input: AttentionInput): readonly AttentionItem[];
