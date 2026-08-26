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
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type Config } from '../config.ts';
/** Required services for locale registration, the connection face, slots, and sessions. */
export declare const inject: string[];
/**
 * Client plugin body: register the dictionaries, the header action, and the
 * settings card keyed by the `goodjob` namespace.
 * @param ctx - client root context.
 * @param config - host-side config echoed through the client graph.
 */
export declare function apply(ctx: ClientContext, config?: Config): void;
