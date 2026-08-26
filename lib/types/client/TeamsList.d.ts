import type { GoodJobRuntimeTeamMember, GoodJobRuntimeTeamTask, GoodJobTeamMessageView } from '../types.ts';
/** GoodJob loopback RPC caller used by Team controls. */
export interface GoodJobRpc {
    call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{
        ok: true;
        value: unknown;
    } | {
        ok: false;
        error: {
            message: string;
        };
    }>;
}
/** Props for the optional Team section. */
export interface TeamsListProps {
    sessionId: string;
    members: readonly GoodJobRuntimeTeamMember[];
    tasks: readonly GoodJobRuntimeTeamTask[];
    messages: readonly GoodJobTeamMessageView[];
    showTasks: boolean;
    showMailbox: boolean;
    rpc: GoodJobRpc;
    onOpen(member: GoodJobRuntimeTeamMember): void;
    onChanged(): void;
}
/** Render the live Team adapter and durable mailbox. */
export declare function TeamsList(props: TeamsListProps): import("react").JSX.Element;
