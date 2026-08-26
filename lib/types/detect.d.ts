/**
 * Capability-seam detection for GoodJob.
 *
 * GoodJob consumes only seams their owning DSH packages expose. Each seam is
 * optional: an absent one disables the matching feature and names the
 * required DeepSeek Harness floor, and a service that mounts later attaches
 * through the `internal/service` event instead of failing the composition.
 * @module dsh-goodjob/detect
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ProjectionRegistry } from './types.ts';
/**
 * The DeepSeek Harness floor GoodJob is built against: a tree carrying
 * `@deepseek-ai/dsh-wait` (the durable-agent-waits capability) and the
 * non-consuming `jobs.observe` API. No released DSH version ships both yet;
 * run from a source checkout of the deepseek-harness main branch that
 * contains them.
 */
export declare const REQUIRED_DSH_FLOOR = "deepseek-harness main with @deepseek-ai/dsh-wait and jobs.observe";
/** Structural faces of the seams GoodJob consumes. */
export interface DetectedSeams {
    /** Session-projection registry; undefined while not yet composed. */
    readonly projections: ProjectionRegistry | undefined;
    /** Settings registry; undefined while not yet composed. */
    readonly settings: {
        register(ns: 'goodjob', schema: unknown): () => void;
    } | undefined;
}
/** Names of every seam GoodJob optionally consumes. */
export declare const SEAM_NAMES: readonly ["sessionProjections", "settings"];
/**
 * Read each seam through `ctx.get`, which returns undefined for absent
 * services without topology sensitivity.
 * @param ctx - host plugin context.
 * @returns the detected seams.
 */
export declare function detectSeams(ctx: Context): DetectedSeams;
/**
 * Human diagnostics for the seams that were absent at load. A seam listed
 * here may still appear later; {@link wireLate} attaches it when it does.
 * @param detected - the detected seam set.
 * @returns one line per absent seam, empty when everything resolved.
 */
export declare function missingSeamDiagnostics(detected: DetectedSeams): readonly string[];
