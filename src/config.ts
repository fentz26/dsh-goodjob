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
  autoFollowOutput: z.boolean().default(DEFAULTS.autoFollowOutput),
})
