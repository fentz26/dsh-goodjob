import type { Branded } from '@deepseek-ai/dsh-brand';
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
/** Opaque Session-local identity of one GoodJob Job Group. */
export type GoodJobGroupId = Branded<'goodjob-group-id'>;
/** Durable logical relation around existing Jobs. */
export interface GoodJobGroupView {
    /** Opaque group identity. */
    id: GoodJobGroupId;
    /** Session that created and may mutate the group. */
    ownerSessionId: string;
    /** Compare-and-set revision, starting at one. */
    revision: number;
    /** Human and model-facing label. */
    label: string;
    /** Existing Job ids in stable member order. */
    jobIds: readonly string[];
    /** Host epoch milliseconds at creation. */
    createdAt: number;
}
/** Versioned durable mutation for GoodJob-owned grouping metadata. */
export type GoodJobGroupChange = {
    version: 1;
    operation: 'create';
    group: GoodJobGroupView;
} | {
    version: 1;
    operation: 'update';
    group: GoodJobGroupView;
} | {
    version: 1;
    operation: 'delete';
    id: GoodJobGroupId;
    ownerSessionId: string;
    expectedRevision: number;
    deletedAt: number;
};
/** Client-visible Job Groups for one Session log. */
export interface GoodJobGroupsProjection {
    /** Groups in creation order. */
    groups: readonly GoodJobGroupView[];
}
/** Durable Team roster row folded without requiring Agent Teams at runtime. */
export interface GoodJobTeamMemberView {
    id: string;
    name: string;
    description: string;
    provider: string;
    context: 'fresh' | 'fork';
    phase: 'provisioning' | 'active' | 'failed';
    error?: string;
}
/** Durable Team task snapshot folded from the Team Lead log. */
export interface GoodJobTeamTaskView {
    id: string;
    revision: number;
    subject: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'deleted';
    ownerId?: string;
    blockedBy: readonly string[];
    writeScopes: readonly string[];
}
/** Durable Team mailbox row with delivery acknowledgement. */
export interface GoodJobTeamMessageView {
    id: string;
    senderId: string;
    senderName: string;
    targetId: string;
    delivery: 'quiet' | 'wakeup';
    text: string;
    queuedAt: number;
    delivered: boolean;
}
/** One Team identity folded from Team-owned Session events. */
export interface GoodJobTeamView {
    teamId: string;
    members: readonly GoodJobTeamMemberView[];
    tasks: readonly GoodJobTeamTaskView[];
    messages: readonly GoodJobTeamMessageView[];
}
/** All Team histories present in one logical Session log, including inherited history. */
export interface GoodJobTeamsProjection {
    teams: readonly GoodJobTeamView[];
}
/**
 * Client-visible mirror of one durable workflow run, folded from
 * `tool-workflow/*` Session events written by `@deepseek-ai/dsh-tool-workflow`.
 * The events carry no timestamps, so this view never invents any: elapsed or
 * wall-clock facts come only from fields upstream actually records.
 */
export interface GoodJobWorkflowRunView {
    /** Stable workflow run identity from the owning tool. */
    id: string;
    /** Display name recorded at run start. */
    name: string;
    /** Run lifecycle derived only from authoritative terminal events. */
    state: 'running' | 'completed' | 'cancelled' | 'error';
    /** Terminal reason, present exactly when the run ended. */
    stopReason?: 'completed' | 'cancelled' | 'error';
    /** Members in publish order; outcomes fill in as they settle. */
    members: readonly GoodJobWorkflowMemberView[];
}
/** One published workflow member (child Agent) of a run. */
export interface GoodJobWorkflowMemberView {
    /** Member sequence within the run. */
    seq: number;
    /** Display label recorded when the member was published. */
    label: string;
    /** Phase name when the caller grouped members into phases. */
    phase?: string;
    /** Child Session published for this member. */
    childId: string;
    /** Settlement outcome, absent while the member runs. */
    outcome?: 'completed' | 'failed' | 'cancelled';
}
/** Whole-value projection of workflow runs folded from one Session log. */
export interface GoodJobWorkflowsProjection {
    /** Runs in first-started order. */
    runs: readonly GoodJobWorkflowRunView[];
}
/**
 * Client-visible mirror of one durable schedule record, folded from
 * `schedule/change` Session events written by `@deepseek-ai/dsh-schedule`.
 * Delivery state is deliberately not stored: it is derived at read time from
 * the explicit absolute target and the current clock.
 */
export interface GoodJobScheduleRecordView {
    /** Session-local stable reminder identity. */
    id: string;
    /** Rule discriminator as authored upstream. */
    kind: 'after' | 'at' | 'every';
    /** Reminder content supplied at creation and delivered on dispatch. */
    prompt: string;
    /** RFC 3339 UTC absolute target (`at` and `every` rules). */
    scheduledAt?: string;
    /** Relative delay in seconds (`after` rule). */
    delayedSeconds?: number;
    /** Fixed interval in seconds (`every` rule). */
    everySeconds?: number;
    /** Whether the record entered the durable dispatch history. */
    dispatched: boolean;
}
/** Whole-value projection of schedules folded from one Session log. */
export interface GoodJobSchedulesProjection {
    /** Active records in creation order. */
    schedules: readonly GoodJobScheduleRecordView[];
}
/** Runtime-enriched Team member returned by the optional Team adapter. */
export interface GoodJobRuntimeTeamMember {
    id: string;
    name: string;
    role: 'lead' | 'teammate';
    status: 'running' | 'idle' | 'inactive' | 'provisioning' | 'failed';
    description?: string;
    provider?: string;
    context?: 'fresh' | 'fork';
    model?: string;
    diagnostics: readonly string[];
}
/** Runtime-enriched Team task returned by the optional Team adapter. */
export interface GoodJobRuntimeTeamTask {
    id: string;
    revision: number;
    subject: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'deleted';
    blockedBy: readonly string[];
    writeScopes: readonly string[];
    ownerName?: string;
    ready: boolean;
    writeScopeWarnings: readonly string[];
}
/** Optional Team adapter snapshot. */
export interface GoodJobRuntimeTeamView {
    available: boolean;
    live: boolean;
    members: readonly GoodJobRuntimeTeamMember[];
    tasks: readonly GoodJobRuntimeTeamTask[];
}
/** One descendant subagent enriched without loading an inactive child. */
export interface GoodJobDescendantView {
    id: string;
    parentId: string;
    depth: number;
    kind: 'child' | 'diagnostic';
    mode?: 'one-shot' | 'continuable';
    label?: string;
    activity?: 'running' | 'inactive';
    hasChildren?: boolean;
    reason?: 'corrupt' | 'unsupported' | 'unavailable';
    model?: string;
    relatedJobIds: readonly string[];
}
/** Read-only operational snapshot served by GoodJob's loopback RPC channel. */
export interface GoodJobOperationsSnapshot {
    descendants: readonly GoodJobDescendantView[];
    team: GoodJobRuntimeTeamView;
}
/** The GoodJob key in the shared client projection table. */
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        /** Folded wait intents for the current session. */
        'goodjob/waits': GoodJobWaitsProjection | null;
        /** Durable GoodJob Job Groups for the current Session. */
        'goodjob/groups': GoodJobGroupsProjection | null;
        /** Durable Agent Teams history, present even when the service is absent. */
        'goodjob/teams': GoodJobTeamsProjection | null;
        /** Workflow runs folded from durable tool-workflow events. */
        'goodjob/workflows': GoodJobWorkflowsProjection | null;
        /** Schedule records folded from durable schedule/change events. */
        'goodjob/schedules': GoodJobSchedulesProjection | null;
    }
}
declare module '@deepseek-ai/dsh-session/types' {
    interface SessionEventMap {
        /** Safe-to-skip GoodJob grouping metadata; execution remains Jobs-owned. */
        'goodjob/group-change': GoodJobGroupChange;
    }
}
/** Projection keys and values GoodJob contributes. */
export interface GoodJobProjectionMap {
    'goodjob/waits': GoodJobWaitsProjection | null;
    'goodjob/groups': GoodJobGroupsProjection | null;
    'goodjob/teams': GoodJobTeamsProjection | null;
    'goodjob/workflows': GoodJobWorkflowsProjection | null;
    'goodjob/schedules': GoodJobSchedulesProjection | null;
}
/** Structural face of the session-projection registry GoodJob registers into. */
export interface ProjectionRegistry {
    register<K extends keyof GoodJobProjectionMap>(definition: {
        key: K;
        stateSchema: ZodType<GoodJobProjectionMap[K]>;
        init(): GoodJobProjectionMap[K];
        apply(state: GoodJobProjectionMap[K], event: unknown): GoodJobProjectionMap[K];
        stateVersion: number;
        wire: {
            viewSchema: ZodType<GoodJobProjectionMap[K]>;
            view(state: GoodJobProjectionMap[K]): GoodJobProjectionMap[K];
        };
    }): () => void;
}
