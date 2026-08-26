/**
 * GoodJob configuration shape and defaults, shared by both halves without
 * dragging the validation schema into the browser bundle.
 * @module dsh-goodjob/config-types
 */

/** Host-side configuration owned by the GoodJob settings card. */
export interface Config {
  /** Show background jobs in the operations view. */
  showJobs?: boolean
  /** Show wait state in the operations view. */
  showWaits?: boolean
  /** Show subagents in the operations view. */
  showSubagents?: boolean
  /** Show durable logical Job Groups in the operations view. */
  showGroups?: boolean
  /** Expand groups with live members when the operations view opens. */
  autoExpandActiveGroups?: boolean
  /** Enable the optional Agent Teams section and controls. */
  showTeams?: boolean
  /** Show the durable Agent Teams mailbox. */
  showTeamMailbox?: boolean
  /** Show Agent Teams tasks and reassignment controls. */
  showTeamTasks?: boolean
  /** Auto-follow live job output while a detail view is open. */
  autoFollowOutput?: boolean
}

/** Defaults for absent keys, mirrored by the client card. */
export const DEFAULTS: Required<Config> = {
  showJobs: true,
  showWaits: true,
  showSubagents: true,
  showGroups: true,
  autoExpandActiveGroups: true,
  showTeams: true,
  showTeamMailbox: true,
  showTeamTasks: true,
  autoFollowOutput: true,
}
