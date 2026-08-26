/**
 * GoodJob host half: settings namespace, capability detection, and the
 * GoodJob's durable projection and operations adapters.
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
import { applyGroupEvent, registerGroupTool } from './groups.ts'
import { applyScheduleEvent } from './schedules.ts'
import { registerGoodJobRpc } from './rpc.ts'
import { applyTeamEvent, registerTeamTaskWaitProvider } from './teams.ts'
import { applyWorkflowEvent } from './workflows.ts'
import { detectSeams, missingSeamDiagnostics } from './detect.ts'
import type { DetectedSeams } from './detect.ts'
import type {
  GoodJobGroupsProjection,
  GoodJobSchedulesProjection,
  GoodJobTeamsProjection,
  GoodJobWaitsProjection,
  GoodJobWorkflowsProjection,
  ProjectionRegistry,
} from './types.ts'

import { ConfigSchema } from './config.ts'
import { DEFAULTS, type Config } from './config-types.ts'

export { ConfigSchema, DEFAULTS }

/** Bump when the fold changes shape; pure additions keep the version. */
const WAITS_STATE_VERSION = 1
const GROUPS_STATE_VERSION = 1
const TEAMS_STATE_VERSION = 1
const WORKFLOWS_STATE_VERSION = 1
const SCHEDULES_STATE_VERSION = 1

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

const groupSchema = zod.object({
  id: zod.string(),
  ownerSessionId: zod.string(),
  revision: zod.number().int().positive(),
  label: zod.string(),
  jobIds: zod.array(zod.string()),
  createdAt: zod.number().int().nonnegative(),
})

const goodJobGroupsSchema = zod.union([
  zod.object({ groups: zod.array(groupSchema) }),
  zod.null(),
]) as unknown as zod.ZodType<GoodJobGroupsProjection | null>

const goodJobTeamsSchema = zod.union([
  zod.object({
    teams: zod.array(zod.object({
      teamId: zod.string(),
      members: zod.array(zod.object({
        id: zod.string(),
        name: zod.string(),
        description: zod.string(),
        provider: zod.string(),
        context: zod.enum(['fresh', 'fork']),
        phase: zod.enum(['provisioning', 'active', 'failed']),
        error: zod.string().optional(),
      })),
      tasks: zod.array(zod.object({
        id: zod.string(),
        revision: zod.number().int().positive(),
        subject: zod.string(),
        description: zod.string(),
        status: zod.enum(['pending', 'in_progress', 'completed', 'deleted']),
        ownerId: zod.string().optional(),
        blockedBy: zod.array(zod.string()),
        writeScopes: zod.array(zod.string()),
      })),
      messages: zod.array(zod.object({
        id: zod.string(),
        senderId: zod.string(),
        senderName: zod.string(),
        targetId: zod.string(),
        delivery: zod.enum(['quiet', 'wakeup']),
        text: zod.string(),
        queuedAt: zod.number().int().nonnegative(),
        delivered: zod.boolean(),
      })),
    })),
  }),
  zod.null(),
]) as zod.ZodType<GoodJobTeamsProjection | null>

const workflowMemberSchema = zod.object({
  seq: zod.number().int(),
  label: zod.string(),
  phase: zod.string().optional(),
  childId: zod.string(),
  outcome: zod.enum(['completed', 'failed', 'cancelled']).optional(),
})

const goodJobWorkflowsSchema = zod.union([
  zod.object({
    runs: zod.array(zod.object({
      id: zod.string(),
      name: zod.string(),
      state: zod.enum(['running', 'completed', 'cancelled', 'error']),
      stopReason: zod.enum(['completed', 'cancelled', 'error']).optional(),
      members: zod.array(workflowMemberSchema),
    })),
  }),
  zod.null(),
]) as unknown as zod.ZodType<GoodJobWorkflowsProjection | null>

const scheduleRecordSchema = zod.object({
  id: zod.string(),
  kind: zod.enum(['after', 'at', 'every']),
  prompt: zod.string(),
  scheduledAt: zod.string().optional(),
  delayedSeconds: zod.number().int().optional(),
  everySeconds: zod.number().int().optional(),
  dispatched: zod.boolean(),
})

const goodJobSchedulesSchema = zod.union([
  zod.object({ schedules: zod.array(scheduleRecordSchema) }),
  zod.null(),
]) as unknown as zod.ZodType<GoodJobSchedulesProjection | null>

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
      () => async () => {
        await Promise.allSettled([...this.lateDisposers].map(dispose => Promise.resolve(dispose())))
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
      this.attachRuntimeAdapters()
    })
    this.attachRuntimeAdapters()
  }

  /** Whether each seam has been wired (immediately or late). */
  private settingsAttached = false
  private projectionsAttached = false
  private groupToolAttached = false
  private teamTaskWaitAttached = false
  private rpcAttached = false
  /** Disposers of seam registrations, drained by the seam-teardown effect. */
  private lateDisposers!: Set<() => void | Promise<void>>

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
    this.lateDisposers.add(registry.register({
      key: 'goodjob/groups',
      stateSchema: goodJobGroupsSchema,
      init: () => null,
      apply: (state, event) => applyGroupEvent(state, event) as GoodJobGroupsProjection | null,
      stateVersion: GROUPS_STATE_VERSION,
      wire: {
        viewSchema: goodJobGroupsSchema,
        view: state => state,
      },
    }))
    this.lateDisposers.add(registry.register({
      key: 'goodjob/teams',
      stateSchema: goodJobTeamsSchema,
      init: () => null,
      apply: (state, event) => applyTeamEvent(state, event) as GoodJobTeamsProjection | null,
      stateVersion: TEAMS_STATE_VERSION,
      wire: {
        viewSchema: goodJobTeamsSchema,
        view: state => state,
      },
    }))
    this.lateDisposers.add(registry.register({
      key: 'goodjob/workflows',
      stateSchema: goodJobWorkflowsSchema,
      init: () => null,
      // Durable tool-workflow events fold deterministically; unknown types are
      // inert so future upstream additions replay as no-ops here.
      apply: (state, event) => applyWorkflowEvent(state, event),
      stateVersion: WORKFLOWS_STATE_VERSION,
      wire: {
        viewSchema: goodJobWorkflowsSchema,
        view: state => state,
      },
    }))
    this.lateDisposers.add(registry.register({
      key: 'goodjob/schedules',
      stateSchema: goodJobSchedulesSchema,
      init: () => null,
      apply: (state, event) => applyScheduleEvent(state, event),
      stateVersion: SCHEDULES_STATE_VERSION,
      wire: {
        viewSchema: goodJobSchedulesSchema,
        view: state => state,
      },
    }))
  }

  /** Attach operational adapters once their owning services are composed. */
  private attachRuntimeAdapters(): void {
    if (!this.groupToolAttached
      && this.ctx.get('tools') !== undefined
      && this.ctx.get('jobs') !== undefined
      && this.ctx.get('sessions') !== undefined) {
      this.groupToolAttached = true
      this.lateDisposers.add(registerGroupTool(this.ctx))
    }
    if (!this.teamTaskWaitAttached
      && this.ctx.get('waits') !== undefined
      && this.ctx.get('agentTeams') !== undefined) {
      this.teamTaskWaitAttached = true
      this.lateDisposers.add(registerTeamTaskWaitProvider(this.ctx))
    }
    if (!this.rpcAttached && this.ctx.get('connection') !== undefined) {
      this.rpcAttached = true
      this.lateDisposers.add(registerGoodJobRpc(this.ctx))
    }
  }
}
