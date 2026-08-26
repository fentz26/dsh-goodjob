# Workflows

Durable `tool-workflow/*` Session events written by the model-facing workflow tool into its calling parent Session are folded by GoodJob into a read-only view.

- **Authority**: the four upstream event types — `run-start`, `agent-start`, `agent-end`, `run-end` — folded by `src/workflows.ts`. The fold is deterministic and differential-tested: full replay equals incremental application.
- **Model**: each run carries only what the events record — id, name, member list (seq, label, optional phase, child Session id), per-member outcome (`completed`/`failed`/`cancelled`), terminal state (`completed`/`cancelled`/`error`). No timestamps or percentages are invented; settled counts are shown as facts (`3/5 members settled`).
- **Workspace surfaces**: Explorer **Workflows** section, run editor with navigable child-Agent rows, unknown-event tolerance (future event versions fold as no-ops).

Live-only workflow internals (execution logs, live phases) remain owned by DSH and are intentionally not mirrored here.
