import type { Context } from '@deepseek-ai/cordis';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { GoodJobGroupId, GoodJobGroupsProjection, GoodJobGroupView } from './types.ts';
/** Stable empty projection used before the first group mutation. */
export declare const NO_GROUPS: GoodJobGroupsProjection;
/** Error raised when GoodJob's durable group history is inconsistent. */
export declare class GoodJobGroupLogError extends Error {
    constructor(message: string);
}
/** Brand one validated group identity. */
export declare function groupId(value: string): GoodJobGroupId;
/** Apply one current-version group mutation to a projection. */
export declare function applyGroupEvent(state: GoodJobGroupsProjection | null | undefined, event: unknown): GoodJobGroupsProjection | null | undefined;
/** Replay current-version groups after the fork seed. */
export declare function foldGroups(events: readonly SessionEvent[], seedLength?: number): GoodJobGroupView[];
/** Register GoodJob's single group-management and group-wait tool. */
export declare function registerGroupTool(ctx: Context): () => void;
