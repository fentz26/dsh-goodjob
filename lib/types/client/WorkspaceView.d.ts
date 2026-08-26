import type { IApiClient, JobView, SessionId } from '@deepseek-ai/dsh-client-connection/client';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { Config } from '../config-types.ts';
import type { GoodJobGroupView, GoodJobRuntimeTeamMember, GoodJobRuntimeTeamTask, GoodJobTeamMessageView, GoodJobWaitView } from '../types.ts';
import { type AgentRow } from './AgentsList.tsx';
import { NS } from './locales.ts';
import type { GoodJobRpc } from './TeamsList.tsx';
/** One Job paired with the Session id required by `jobs.observe`. */
export interface OwnedJob {
    sessionId: string;
    job: JobView;
}
/** Authoritative domain values projected into the workspace. */
export interface WorkspaceDomain {
    rootSessionId: string;
    agents: readonly AgentRow[];
    jobs: readonly OwnedJob[];
    groups: readonly GoodJobGroupView[];
    waits: readonly GoodJobWaitView[];
    teamAvailable: boolean;
    teamLive: boolean;
    teamMembers: readonly GoodJobRuntimeTeamMember[];
    tasks: readonly GoodJobRuntimeTeamTask[];
    messages: readonly GoodJobTeamMessageView[];
}
/** One presentation lens discovered from the DSH conversation-view registry. */
export interface WorkspaceSessionView {
    id: string;
    label: string;
}
/** Runtime dependencies supplied to the native GoodJob view. */
export interface WorkspaceInjected {
    api: IApiClient;
    rpc: GoodJobRpc;
    config: Required<Config>;
    refreshSubagents(parentSessionId: SessionId): Promise<void>;
    openChild(address: {
        parentSessionId: SessionId;
        childSessionId: SessionId;
        mode: 'continuable' | 'one-shot';
    }): void;
    sessionViews: {
        list(): readonly WorkspaceSessionView[];
        subscribe(listener: () => void): () => void;
        version(): number;
    };
}
/** Full props for the native conversation view. */
export type WorkspaceViewProps = PropsRuntime<'conversation.view'> & PropsLocale<typeof NS> & InjectFace<WorkspaceInjected>;
/**
 * Structural face of an upstream session slot host. Unreleased DeepSeek
 * Harness builds inject this component into session-scoped slot entries so a
 * registered view can be hosted for an explicit Session; published builds
 * leave the prop undefined and GoodJob renders its own fallback instead.
 */
export type SessionSlotHostComponent = (props: {
    name: string;
    sessionId: SessionId;
    owner: {
        inspect: null;
        onInspectDone: () => void;
    };
    opts?: {
        only?: string;
        fallback?: React.ReactNode;
    };
}) => React.ReactNode;
/** Props for the presentation-only workspace component used by browser tests. */
export interface GoodJobWorkspaceProps {
    domain: WorkspaceDomain;
    api: IApiClient;
    rpc: GoodJobRpc;
    config: Required<Config>;
    storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
    onOpenSession(agent: AgentRow): void;
    onRefresh(): void;
    sessionViews: readonly WorkspaceSessionView[];
    sessionSlotHost?: SessionSlotHostComponent;
}
/** Native view wrapper: subscribe to DSH mirrors and read optional runtime adapters once. */
export declare function WorkspaceView(props: WorkspaceViewProps): import("react").JSX.Element;
/** Render the IDE-style shell over current DSH projections. */
export declare function GoodJobWorkspace(props: GoodJobWorkspaceProps): import("react").JSX.Element;
