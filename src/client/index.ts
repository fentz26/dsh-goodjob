/**
 * GoodJob browser half entry: locale dictionaries, the session-header
 * operations action, and the Settings → Plugins card.
 *
 * Registrations are effects of this plugin's fiber, so disabling the bundle
 * removes the header action, the card, and the dictionaries together. The
 * injected faces close over this apply's ctx only; components receive plain
 * data and callbacks.
 * @module dsh-goodjob/client
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { DEFAULTS, type Config } from '../config.ts'
import { OperationsAction } from './OperationsAction.tsx'
import type { OperationsInjected } from './OperationsAction.tsx'
import { GoodJobSettingsCard } from './SettingsCard.tsx'
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
 * Client plugin body: register the dictionaries, the header action, and the
 * settings card keyed by the `goodjob` namespace.
 * @param ctx - client root context.
 * @param config - host-side config echoed through the client graph.
 */
export function apply(ctx: ClientContext, config: Config = {}): void {
  const resolved: Required<Config> = {
    showJobs: config.showJobs ?? DEFAULTS.showJobs,
    showWaits: config.showWaits ?? DEFAULTS.showWaits,
    showSubagents: config.showSubagents ?? DEFAULTS.showSubagents,
    autoFollowOutput: config.autoFollowOutput ?? DEFAULTS.autoFollowOutput,
  }
  void resolved
  ctx.effect(() => {
    if (document.querySelector('style[data-plugin="dsh-goodjob"]') !== null) return () => {}
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-goodjob'
    tag.textContent = STYLES
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'goodjob: stylesheet')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'goodjob: dictionaries')
  ctx.slots.inject(
    'conversation.session.header.actions',
    () => ctx.slots.register({
      name: 'conversation.session.header.actions',
      id: 'goodjob-operations',
      order: 30,
      locale: NS,
      inject: (): OperationsInjected => ({
        api: (ctx.get('connection') as unknown as { api: OperationsInjected['api'] }).api,
        refreshSubagents: parentSessionId => (sessionsFace(ctx)).refreshSubagents(parentSessionId),
        openChild: address => (sessionsFace(ctx)).openSubagent(address),
      }),
    }, OperationsAction),
  )
  ctx.slots.inject('settings.plugin.item', function* () {
    yield ctx.slots.register({
      name: 'settings.plugin.item',
      key: 'goodjob',
      locale: NS,
      inject: () => ({
        api: (ctx.get('connection') as unknown as { api: OperationsInjected['api'] }).api,
      }),
    }, GoodJobSettingsCard)
  })
}
