/** Read-only Agent Teams projection and the Team-task wait adapter. */
import type { Context } from '@deepseek-ai/cordis';
import type { GoodJobTeamsProjection } from './types.ts';
/** Stable empty Team projection. */
export declare const NO_TEAMS: GoodJobTeamsProjection;
/** Apply one Team-owned Session event without importing the experimental package. */
export declare function applyTeamEvent(state: GoodJobTeamsProjection | null | undefined, event: unknown): GoodJobTeamsProjection | null | undefined;
/** Register current-state Team task completion over durable Team snapshots. */
export declare function registerTeamTaskWaitProvider(ctx: Context): () => void;
