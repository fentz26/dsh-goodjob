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
import { Service } from '@deepseek-ai/cordis';
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { Config, DEFAULTS } from './config.ts';
export { Config, DEFAULTS };
/**
 * The GoodJob operations service. The class is the bundle row's mount point:
 * it registers the settings namespace, detects capability seams with
 * actionable diagnostics, and installs the waits projection wherever a
 * session-projection registry is composed.
 */
export default class GoodJobService extends Service {
    static Config: z<Config>;
    /** Resolved configuration snapshot captured at load. */
    readonly config: Required<Config>;
    /**
     * Create the service. Schemastery validated and defaulted `config` before
     * construction.
     * @param ctx - Cordis context owning this fiber.
     * @param config - validated plugin configuration.
     */
    constructor(ctx: Context, config: Config);
}
