/**
 * GoodJob browser half entry: locale dictionaries, the native operations
 * workspace, and the Settings → Plugins card.
 *
 * Registrations are effects of this plugin's fiber, so disabling the bundle
 * removes the view, the card, and the dictionaries together. The
 * injected faces close over this apply's ctx only; components receive plain
 * data and callbacks.
 * @module dsh-goodjob/client
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import { DEFAULTS, type Config } from '../config-types.ts'
import { GoodJobSettingsCard } from './SettingsCard.tsx'
import { WorkspaceView } from './WorkspaceView.tsx'
import type { WorkspaceInjected } from './WorkspaceView.tsx'
import { en, NS, zh } from './locales.ts'
import { STYLES } from './styles.ts'

/** Required services for locale registration, the connection face, slots, and sessions. */
export const inject = ['sessions', 'slots', 'locale', 'connection']

/** Structural face of the sessions service this plugin calls. */
interface SessionsFace {
  refreshSubagents(parentSessionId: string): Promise<void>
  openSubagent(address: {
    parentSessionId: string
    childSessionId: string
    mode: 'continuable' | 'one-shot'
  }): void
}

/** Read the sessions service structurally; out-of-tree builds must not depend
 * on host/client augmentation order for the Cordis context merge. */
function sessionsFace(ctx: ClientContext): SessionsFace {
  return (ctx as unknown as { sessions: SessionsFace }).sessions
}

/**
 * Client plugin body: register the dictionaries, native workspace view, and
 * settings card keyed by the `goodjob` namespace.
 * @param ctx - client root context.
 * @param config - host-side config echoed through the client graph.
 */
export function apply(ctx: ClientContext, config: Config = {}): void {
  const resolved: Required<Config> = {
    showJobs: config.showJobs ?? DEFAULTS.showJobs,
    showWaits: config.showWaits ?? DEFAULTS.showWaits,
    showSubagents: config.showSubagents ?? DEFAULTS.showSubagents,
    showGroups: config.showGroups ?? DEFAULTS.showGroups,
    autoExpandActiveGroups: config.autoExpandActiveGroups ?? DEFAULTS.autoExpandActiveGroups,
    showTeams: config.showTeams ?? DEFAULTS.showTeams,
    showTeamMailbox: config.showTeamMailbox ?? DEFAULTS.showTeamMailbox,
    showTeamTasks: config.showTeamTasks ?? DEFAULTS.showTeamTasks,
    autoFollowOutput: config.autoFollowOutput ?? DEFAULTS.autoFollowOutput,
    restoreWorkspace: config.restoreWorkspace ?? DEFAULTS.restoreWorkspace,
    showActivityFeed: config.showActivityFeed ?? DEFAULTS.showActivityFeed,
    showGraph: config.showGraph ?? DEFAULTS.showGraph,
    showCompletedJobs: config.showCompletedJobs ?? DEFAULTS.showCompletedJobs,
    showCompletedTasks: config.showCompletedTasks ?? DEFAULTS.showCompletedTasks,
    maxRenderedOutputChars: config.maxRenderedOutputChars ?? DEFAULTS.maxRenderedOutputChars,
    outputObserveIntervalMs: config.outputObserveIntervalMs ?? DEFAULTS.outputObserveIntervalMs,
  }
  ctx.effect(() => {
    if (document.querySelector('style[data-plugin="dsh-goodjob"]') !== null) return () => {}
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-goodjob'
    tag.textContent = STYLES
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'goodjob: stylesheet')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'goodjob: dictionaries')
  const t = ctx.locale.bind(NS)
  const sessionViews = {
    list: () => ctx.slots.entries('conversation.view').flatMap((entry) => {
      const id = entry.options.id
      return id === undefined ? [] : [{
        id,
        label: resolveSlotLabel(entry.options.label) ?? id,
      }]
    }),
    subscribe: (listener: () => void) => ctx.slots.subscribe('conversation.view', listener),
    version: () => ctx.slots.getVersion('conversation.view'),
  }
  const injected = (): WorkspaceInjected => ({
    api: (ctx.get('connection') as unknown as {
      api: WorkspaceInjected['api']
      rpc: WorkspaceInjected['rpc']
    }).api,
    rpc: (ctx.get('connection') as unknown as { rpc: WorkspaceInjected['rpc'] }).rpc,
    config: resolved,
    refreshSubagents: parentSessionId => sessionsFace(ctx).refreshSubagents(parentSessionId),
    openChild: address => sessionsFace(ctx).openSubagent(address),
    sessionViews,
  })
  ctx.slots.inject(
    'conversation.view',
    () => ctx.slots.register({
      name: 'conversation.view',
      id: 'goodjob',
      order: 30,
      locale: NS,
      label: () => t('view.workspace'),
      inject: injected,
    }, WorkspaceView),
  )
  ctx.slots.inject('settings.plugin.item', function* () {
    yield ctx.slots.register({
      name: 'settings.plugin.item',
      key: 'goodjob',
      locale: NS,
      inject: () => ({
        api: (ctx.get('connection') as unknown as { api: WorkspaceInjected['api'] }).api,
      }),
    }, GoodJobSettingsCard)
  })
}
