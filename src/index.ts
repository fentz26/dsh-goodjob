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
import type { DetectedSeams } from './detect.ts'
import type { GoodJobWaitsProjection, ProjectionRegistry } from './types.ts'

import { ConfigSchema } from './config.ts'
import { DEFAULTS, type Config } from './config-types.ts'

export { ConfigSchema, DEFAULTS }

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
  static Config: z<Config> = ConfigSchema

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
    // A seam absent at load may still mount later in the same composition;
    // `internal/service` fires on every binding, so attach lazily. The
    // diagnostics name the floor rather than pretending permanence.
    // Late seam attachments cannot create their own effects from an event
    // callback, so every disposer — immediate or late — drains through this
    // single teardown effect on the service fiber.
    this.lateDisposers = new Set()
    ctx.effect(
      () => () => {
        for (const dispose of this.lateDisposers) dispose()
        this.lateDisposers.clear()
      },
      'goodjob: seam teardown',
    )
    this.attachSeams(detected)
    ctx.on('internal/service', (name: string, value: unknown) => {
      if (name === 'settings' && this.settingsAttached === false) {
        this.settingsAttached = true
        this.attachSettings(value as NonNullable<DetectedSeams['settings']>)
      }
      if (name === 'sessionProjections' && this.projectionsAttached === false) {
        this.projectionsAttached = true
        this.attachProjections(value as NonNullable<DetectedSeams['projections']>)
      }
    })
  }

  /** Whether each seam has been wired (immediately or late). */
  private settingsAttached = false
  private projectionsAttached = false
  /** Disposers of seam registrations, drained by the seam-teardown effect. */
  private lateDisposers!: Set<() => void>

  /**
   * Wire every seam present at construction and report the absent ones.
   * @param detected - seams resolved from the global store at load.
   */
  private attachSeams(detected: DetectedSeams): void {
    for (const line of missingSeamDiagnostics(detected)) process.stderr.write(`${line}\n`)
    if (detected.settings !== undefined) this.attachSettings(detected.settings)
    if (detected.projections !== undefined) this.attachProjections(detected.projections)
  }

  /**
   * Register the settings namespace as an effect of this service's fiber.
   * @param settings - the settings registry seam.
   */
  private attachSettings(settings: NonNullable<DetectedSeams['settings']>): void {
    this.settingsAttached = true
    this.lateDisposers.add(settings.register('goodjob', ConfigSchema))
  }

  /**
   * Install the waits projection. The registry keys its internal effect to
   * its own context, so GoodJob owns the returned disposer: unloading this
   * service unregisters the key even while the projection registry stays
   * mounted.
   * @param registry - the session-projection registry seam.
   */
  private attachProjections(registry: NonNullable<DetectedSeams['projections']>): void {
    this.projectionsAttached = true
    this.lateDisposers.add(registry.register({
      key: 'goodjob/waits',
      stateSchema: goodJobWaitsSchema,
      init: () => null,
      apply: (state, event) => applyWaitEvent(state, event) as GoodJobWaitsProjection | null,
      stateVersion: WAITS_STATE_VERSION,
      wire: {
        viewSchema: goodJobWaitsSchema,
        view: state => state,
      },
    }))
  }
}
