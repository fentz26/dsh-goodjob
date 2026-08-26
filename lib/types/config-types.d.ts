/**
 * GoodJob configuration shape and defaults, shared by both halves without
 * dragging the validation schema into the browser bundle.
 * @module dsh-goodjob/config-types
 */
/** Host-side configuration owned by the GoodJob settings card. */
export interface Config {
    /** Show background jobs in the operations view. */
    showJobs?: boolean;
    /** Show wait state in the operations view. */
    showWaits?: boolean;
    /** Show subagents in the operations view. */
    showSubagents?: boolean;
    /** Auto-follow live job output while a detail view is open. */
    autoFollowOutput?: boolean;
}
/** Defaults for absent keys, mirrored by the client card. */
export declare const DEFAULTS: Required<Config>;
