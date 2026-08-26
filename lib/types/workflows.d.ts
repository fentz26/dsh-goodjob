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
import type { GoodJobWorkflowRunView, GoodJobWorkflowsProjection } from './types.ts';
/** Member outcome vocabulary as authored by the upstream tool. */
export type WorkflowAgentOutcome = 'completed' | 'failed' | 'cancelled';
/** Stable empty projection used before any run starts. */
export declare const NO_WORKFLOWS: GoodJobWorkflowsProjection;
/** Narrow one raw session-log record to a workflow run start. */
export declare function isRunStart(value: unknown): value is {
    type: 'tool-workflow/run-start';
    runId: string;
    name: string;
};
/** Narrow one raw session-log record to a workflow member publish. */
export declare function isAgentStart(value: unknown): value is {
    type: 'tool-workflow/agent-start';
    runId: string;
    seq: number;
    label: string;
    phase?: string;
    childId: string;
};
/** Narrow one raw session-log record to a member settlement. */
export declare function isAgentEnd(value: unknown): value is {
    type: 'tool-workflow/agent-end';
    runId: string;
    seq: number;
    outcome: WorkflowAgentOutcome;
};
/** Narrow one raw session-log record to a terminal run event. */
export declare function isRunEnd(value: unknown): value is {
    type: 'tool-workflow/run-end';
    runId: string;
    stopReason: GoodJobWorkflowRunView['stopReason'] & {};
};
/**
 * Apply one committed session event to the previous workflows value.
 * @param state - previous value (null before anything folded).
 * @param event - one raw committed Session event.
 * @returns the next value; an equal reference when nothing changed.
 */
export declare function applyWorkflowEvent(state: GoodJobWorkflowsProjection | null | undefined, event: unknown): GoodJobWorkflowsProjection | null;
