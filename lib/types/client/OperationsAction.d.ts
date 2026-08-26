import type { IApiClient, SessionId } from '@deepseek-ai/dsh-client-connection/client';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
/** Business dependencies injected by the plugin registration. */
export interface OperationsInjected {
    /** The typed client API face (jobs observe + subagent control). */
    api: IApiClient;
    /** Refresh this parent's subagent catalog mirror. */
    refreshSubagents(parentSessionId: SessionId): Promise<void>;
    /** Open one child transcript in the existing conversation surface. */
    openChild(address: {
        parentSessionId: SessionId;
        childSessionId: SessionId;
        mode: 'continuable' | 'one-shot';
    }): void;
}
/** Full props for the session-header operations action. */
export type OperationsActionProps = PropsRuntime<'conversation.session.header.actions'> & PropsLocale<typeof NS> & InjectFace<OperationsInjected>;
/**
 * Session-header entry point for the unified operations view. Sections
 * collapse when their domain has nothing to show.
 * @param props - runtime slot currency, translator, and injected API.
 * @returns the trigger button and its popover.
 */
export declare function OperationsAction({ sessionId, useSessions, useProjection, t, api, refreshSubagents, openChild, }: OperationsActionProps): import("react").JSX.Element;
