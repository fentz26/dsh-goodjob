import type { IApiClient, SessionId } from '@deepseek-ai/dsh-client-connection/client';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { Config } from '../config-types.ts';
import { NS } from './locales.ts';
import { type GoodJobRpc } from './TeamsList.tsx';
/** Business dependencies injected by the plugin registration. */
export interface OperationsInjected {
    api: IApiClient;
    rpc: GoodJobRpc;
    config: Required<Config>;
    refreshSubagents(parentSessionId: SessionId): Promise<void>;
    openChild(address: {
        parentSessionId: SessionId;
        childSessionId: SessionId;
        mode: 'continuable' | 'one-shot';
    }): void;
}
/** Full props for the session-header operations action. */
export type OperationsActionProps = PropsRuntime<'conversation.session.header.actions'> & PropsLocale<typeof NS> & InjectFace<OperationsInjected>;
/** Session-header entry point for subagents, Jobs, groups, waits, and optional Teams. */
export declare function OperationsAction(props: OperationsActionProps): import("react").JSX.Element;
