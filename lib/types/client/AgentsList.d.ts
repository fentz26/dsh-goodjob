import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client';
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
/** One renderable catalog child. */
export interface AgentRow {
    /** Child session id. */
    id: string;
    /** Catalog label; one-shots may be unlabeled. */
    label?: string;
    /** Delivery mode; continuable children accept further prompts. */
    mode: 'one-shot' | 'continuable';
    /** Driver state at the last catalog refresh. */
    activity: 'running' | 'inactive';
}
/** Props for {@link AgentsList}. */
export interface AgentsListProps {
    /** Parent (current) session id used to address every child. */
    sessionId: string;
    /** Catalog rows for the current session's direct children. */
    agents: readonly AgentRow[];
    /** Subagent control API. */
    subagentsApi: IApiClient['subagents'];
    /** Open one child transcript in the existing conversation surface. */
    onOpen(childSessionId: string): void;
    /** Namespace translator. */
    t: TranslateNS<typeof NS>;
}
/**
 * Render the agents section body with per-row actions.
 * @param props - parent id, agents, API, translator.
 * @returns the list, or the empty line.
 */
export declare function AgentsList({ sessionId, agents, subagentsApi, onOpen, t }: AgentsListProps): import("react").JSX.Element;
/** Narrow a raw catalog entry to the renderable child shape; diagnostics rows are skipped. */
export declare function toAgentRow(entry: unknown): AgentRow | undefined;
