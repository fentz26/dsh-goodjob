/**
 * GoodJob configuration schema: the validated face of {@link ./config-types.ts}
 * for composition and the user settings document.
 * @module dsh-goodjob/config
 */
import z from '@deepseek-ai/schemastery'
import { DEFAULTS } from './config-types.ts'
import type { Config } from './config-types.ts'

export { DEFAULTS }
export type { Config }

/** The validated configuration schema. */
export const ConfigSchema: z<Config> = z.object({
  showJobs: z.boolean().default(DEFAULTS.showJobs),
  showWaits: z.boolean().default(DEFAULTS.showWaits),
  showSubagents: z.boolean().default(DEFAULTS.showSubagents),
  showGroups: z.boolean().default(DEFAULTS.showGroups),
  autoExpandActiveGroups: z.boolean().default(DEFAULTS.autoExpandActiveGroups),
  showTeams: z.boolean().default(DEFAULTS.showTeams),
  showTeamMailbox: z.boolean().default(DEFAULTS.showTeamMailbox),
  showTeamTasks: z.boolean().default(DEFAULTS.showTeamTasks),
  autoFollowOutput: z.boolean().default(DEFAULTS.autoFollowOutput),
  restoreWorkspace: z.boolean().default(DEFAULTS.restoreWorkspace),
  showActivityFeed: z.boolean().default(DEFAULTS.showActivityFeed),
  showGraph: z.boolean().default(DEFAULTS.showGraph),
  showCompletedJobs: z.boolean().default(DEFAULTS.showCompletedJobs),
  showCompletedTasks: z.boolean().default(DEFAULTS.showCompletedTasks),
  maxRenderedOutputChars: z.number().min(10_000).max(1_000_000).default(DEFAULTS.maxRenderedOutputChars),
  outputObserveIntervalMs: z.number().min(250).max(10_000).default(DEFAULTS.outputObserveIntervalMs),
})
