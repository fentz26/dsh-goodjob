/**
 * GoodJob host half: settings namespace, capability detection, and the
 * `goodjob/waits` session projection unit.
 *
 * GoodJob owns no domain authority. Jobs reach the browser through the
 * existing `jobsBySession` mirror and the non-consuming observe RPC;
 * subagents through the subagent catalog and control RPCs; waits through this
 * projection, which folds the `wait/change` events their owning package
 * already logs. Unloading the plugin removes its registrations as effects of
 * this service's fiber, so the projection key disappears from the feed
 * without touching durable history.
 * @module dsh-goodjob
 */
import { Service } from '@deepseek-ai/cordis'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { z as zod } from 'zod'
// Type-only: resolves ctx.sessionProjections where a projection registry is composed.
import type {} from '@deepseek-ai/dsh-session-projection'
import { applyWaitEvent } from './fold.ts'
import { detectSeams, missingSeamDiagnostics } from './detect.ts'
import type { GoodJobWaitsProjection, ProjectionRegistry } from './types.ts'

import { Config, DEFAULTS } from './config.ts'

export { Config, DEFAULTS }

/** Bump when the fold changes shape; pure additions keep the version. */
const WAITS_STATE_VERSION = 1

/** Wire schema validating the whole projection value on both sides. */
const goodJobWaitsSchema: zod.ZodType<GoodJobWaitsProjection | null> = zod.union([
  zod.object({
    waits: zod.array(zod.object({
      id: zod.string(),
      sessionId: zod.string(),
      createdAt: zod.number(),
      mode: zod.union([zod.literal('any'), zod.literal('all')]),
      leaves: zod.array(zod.object({
        index: zod.number().int().nonnegative(),
        provider: zod.string().optional(),
        input: zod.unknown().optional(),
        result: zod.unknown().optional(),
      })),
      status: zod.union([
        zod.literal('pending'), zod.literal('ready'), zod.literal('dispatched'), zod.literal('cancelled'),
      ]),
      winnerIndex: zod.number().int().nonnegative().optional(),
    })),
  }),
  zod.null(),
])

/**
 * The GoodJob operations service. The class is the bundle row's mount point:
 * it registers the settings namespace, detects capability seams with
 * actionable diagnostics, and installs the waits projection wherever a
 * session-projection registry is composed.
 */
export default class GoodJobService extends Service {
  static Config: z<Config> = Config

  /** Resolved configuration snapshot captured at load. */
  readonly config: Required<Config>

  /**
   * Create the service. Schemastery validated and defaulted `config` before
   * construction.
   * @param ctx - Cordis context owning this fiber.
   * @param config - validated plugin configuration.
   */
  constructor(ctx: Context, config: Config) {
    super(ctx, 'goodjob')
    this.config = config as unknown as Required<Config>
    const detected = detectSeams(ctx)
    for (const line of missingSeamDiagnostics(detected)) process.stderr.write(`${line}\n`)
    if (detected.settings !== undefined) {
      const settings = detected.settings
      ctx.effect(
        () => settings.register('goodjob', Config),
        'goodjob: settings namespace',
      )
    }
    if (detected.projections !== undefined) {
      // The registry keys its internal effect to its own context, so GoodJob
      // owns the returned disposer: unloading this service unregisters the
      // key even while the projection registry stays mounted.
      const projections = detected.projections
      ctx.effect(
        () => projections.register({
          key: 'goodjob/waits',
          stateSchema: goodJobWaitsSchema,
          init: () => null,
          apply: (state, event) => applyWaitEvent(state, event) as GoodJobWaitsProjection | null,
          stateVersion: WAITS_STATE_VERSION,
          wire: {
            viewSchema: goodJobWaitsSchema,
            view: state => state,
          },
        }),
        'goodjob: waits projection',
      )
    }
  }
}
