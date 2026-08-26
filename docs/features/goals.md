# Goals

GoodJob consumes the durable goal domain published by DeepSeek Harness (`@deepseek-ai/dsh-goal`):

- **Authority**: the Session's `goal/change` events and rc.2's built-in `goal` projection (whole-value, last-wins). GoodJob keeps no goal registry of its own.
- **Lifecycle**: phases are exactly upstream's — `active`, `paused`, `blocked`, `complete`; a clear tombstone empties the projection.
- **Workspace surfaces**: Explorer **Goals** section, a Goal editor (objective, phase, blocked reason, round cap, rounds admitted, created/updated), the General **Objectives** section, and Needs Attention when the phase is `blocked`.

Viewing goals never wakes an Agent or spends tokens: everything renders from projection state that already exists. Blocked reasons are displayed verbatim from the authoritative `blockedReason {code, message}`; nothing is inferred.
