# Needs Attention

A unified human-attention surface derived deterministically from authoritative states GoodJob already mirrors. There is no model involvement and no heuristic "stuck" detection from elapsed thresholds.

## Sources (current tranche)

| Source | Condition | Severity |
|---|---|---|
| Goal | phase is `blocked` (reason text shown verbatim) | warning |
| Jobs | status `failed` / `error` | error |
| Team tasks | open task with unfinished authoritative `blockedBy` entries | warning |
| Schedules | undispatched record whose absolute target passed | warning |

Items deduplicate: one underlying blocker appears exactly once and navigates to its source entity. Failures sort ahead of warnings; identifiers within a severity order stably.

## Why idle?

Agent editors expose a deterministic **Why idle?** panel derived from the same graph rules — currently pending waits owned by that Agent's session (`Waiting on wait-X · mode all · 1/2 leaves unresolved`). Reasons appear only when an authoritative relationship exists; otherwise the panel says so explicitly rather than speculating.

## Extension policy

New sources (approvals, sandbox denials, human questions, remote A2A input-required) are added only when DSH exposes them authoritatively. Each must state its source type, ids, and navigation target; the visual taxonomy stays limited to `blocked`, `failed`, `input-required`, `approval-required`, `overdue`, and `unavailable`.
