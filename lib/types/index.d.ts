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
    /** Whether each seam has been wired (immediately or late). */
    private settingsAttached;
    private projectionsAttached;
    /**
     * Wire every seam present at construction and report the absent ones.
     * @param detected - seams resolved from the global store at load.
     */
    private attachSeams;
    /**
     * Register the settings namespace as an effect of this service's fiber.
     * @param settings - the settings registry seam.
     */
    private attachSettings;
    /**
     * Install the waits projection. The registry keys its internal effect to
     * its own context, so GoodJob owns the returned disposer: unloading this
     * service unregisters the key even while the projection registry stays
     * mounted.
     * @param registry - the session-projection registry seam.
     */
    private attachProjections;
}
