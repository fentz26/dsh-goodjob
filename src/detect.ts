/**
 * Capability-seam detection for GoodJob.
 *
 * GoodJob consumes only seams their owning DSH packages expose. Each seam is
 * optional at load: a missing one disables the matching feature and names the
 * required DeepSeek Harness floor, so an installation against an older build
 * degrades with an actionable diagnostic instead of failing the composition.
 * @module dsh-goodjob/detect
 */
import type { Context } from '@deepseek-ai/cordis'
import type { ProjectionRegistry } from './types.ts'

/**
 * The DeepSeek Harness floor GoodJob is built against: a tree carrying
 * `@deepseek-ai/dsh-wait` (the durable-agent-waits capability) and the
 * non-consuming `jobs.observe` API. No released DSH version ships both yet;
 * run from a source checkout of the deepseek-harness main branch that
 * contains them.
 */
export const REQUIRED_DSH_FLOOR = 'deepseek-harness main with @deepseek-ai/dsh-wait and jobs.observe'

/** Seams GoodJob reads, resolved from the global service store. */
export interface DetectedSeams {
  /** Session-projection registry; absent means waits cannot reach the browser. */
  readonly projections: ProjectionRegistry | undefined
  /** Settings registry; absent means no user-visible configuration card. */
  readonly settings: { register(ns: 'goodjob', schema: unknown): () => void } | undefined
}

/** Names of every seam GoodJob optionally consumes. */
export const SEAM_NAMES = ['sessionProjections', 'settings'] as const

/**
 * Read each seam through `ctx.get`, which returns undefined for absent
 * services without topology sensitivity.
 * @param ctx - host plugin context.
 * @returns the detected seams.
 */
export function detectSeams(ctx: Context): DetectedSeams {
  return {
    projections: ctx.get('sessionProjections') as ProjectionRegistry | undefined,
    settings: ctx.get('settings') as DetectedSeams['settings'] | undefined,
  }
}

/**
 * Human diagnostics for the seams an installation is missing.
 * @param detected - the detected seam set.
 * @returns one line per missing seam, empty when everything resolved.
 */
export function missingSeamDiagnostics(detected: DetectedSeams): readonly string[] {
  const lines: string[] = []
  if (detected.projections === undefined) {
    lines.push(
      'goodjob: sessionProjections service not composed — wait state will not reach the web UI. '
      + `GoodJob requires ${REQUIRED_DSH_FLOOR}.`,
    )
  }
  if (detected.settings === undefined) {
    lines.push(
      'goodjob: settings service not composed — running without its configuration card. '
      + `GoodJob requires ${REQUIRED_DSH_FLOOR}.`,
    )
  }
  return lines
}
