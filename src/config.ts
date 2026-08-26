/**
 * Shared GoodJob configuration: the single source both halves import, kept
 * free of host-only imports so the browser graph stays clean.
 * @module dsh-goodjob/config
 */
import z from '@deepseek-ai/schemastery'

/** Host-side configuration owned by the GoodJob settings card. */
export interface Config {
  /** Show background jobs in the operations view. */
  showJobs?: boolean
  /** Show wait state in the operations view. */
  showWaits?: boolean
  /** Show subagents in the operations view. */
  showSubagents?: boolean
  /** Auto-follow live job output while a detail view is open. */
  autoFollowOutput?: boolean
}

/** Defaults for absent keys, mirrored by the client card. */
export const DEFAULTS: Required<Config> = {
  showJobs: true,
  showWaits: true,
  showSubagents: true,
  autoFollowOutput: true,
}

/** Validated configuration schema for composition and the user document section. */
export const Config: z<Config> = z.object({
  showJobs: z.boolean().default(DEFAULTS.showJobs),
  showWaits: z.boolean().default(DEFAULTS.showWaits),
  showSubagents: z.boolean().default(DEFAULTS.showSubagents),
  autoFollowOutput: z.boolean().default(DEFAULTS.autoFollowOutput),
})
