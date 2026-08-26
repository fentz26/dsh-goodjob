# GoodJob Workspace architecture

GoodJob registers one native `conversation.view` entry and renders an IDE-style operations workspace inside the existing DSH conversation shell. DSH services and Session projections remain authoritative; the workspace stores only open entity identities, pane placement, active tabs, Explorer collapse state, and filters.

The [IDE workspace Agent Note](../.agents/notes/implemented/architecture/2026-08-26-ide-operations-workspace.md) owns the alternatives and authority rationale; this document describes the current implementation.

## Data flow

```text
DSH Jobs / Session projections / Subagents / optional Agent Teams
                              ↓
                GoodJob read-only adapters
                              ↓
               current entity descriptors
                              ↓
        tabs, Explorer, panes, General, graph
```

Jobs come from the client Session mirror, output pages come from the non-consuming `jobs.observe` API, Waits and Groups come from their Session projection keys, Team mailbox history comes from `goodjob/teams`, and recursive descendant and live Team details come from the loopback `operations.describe` adapter. Viewing the workspace does not create a Session event, wake an Agent, or start a model round.

## Workspace state

Every tab contains only a stable entity address: `general`, `agent:<sessionId>`, `job:<sessionId>:<jobId>`, `group:<groupId>`, `wait:<waitId>`, `task:<taskId>`, or `view:<sessionId>:<viewId>`. Ordinary open focuses an existing tab; open-to-side may place the same address in another pane so two independently mounted views can compare it.

Agent, Job, Job Group, Wait, and task addresses identify domain projections. A `session-view` address identifies a presentation lens registered in DSH's existing `conversation.view` slot for one Session. GoodJob discovers those registrations at runtime and hosts the selected entry through DSH's generic explicit-Session slot host. It does not add another view registry or retain the hosted component.

Trajectory is one such sibling view. Its snapshot, event definitions, ledger, timing, search, folding, virtualization, and tool-call inspection remain owned by `@deepseek-ai/dsh-client-ui-trajectory`; GoodJob depends only on the public registered-view interface. If Trajectory or another view unloads, its workspace tab retains the presentation address and shows an unavailable state until that id is registered again. If the host DSH predates explicit-Session hosting, GoodJob remains usable and disables hosted content without copying the view implementation.

One to four panes share a simple horizontal, vertical, or two-by-two grid. A pane retains all open editor component instances while the workspace remains mounted and hides inactive ones, preserving search text, composers, and Job observer cursors without persisting domain values.

When `restoreWorkspace` is enabled, local storage records the presentation state under the root Session id. Refresh restores addresses and placement, then every editor resolves fresh values from DSH projections; Job status, Agent status, output, Wait settlement, task state, mailbox messages, and hosted-view snapshots are never restored from local storage.

## Explorer and General

The Explorer groups Agents, Jobs, Job Groups, Waits, and optional Team tasks. It renders concise authoritative state, supports text filtering and collapsible sections, and applies visibility settings without retaining copies of the listed objects.

General summarizes objective counts, failed Jobs, blocked tasks, optional-adapter availability, timestamped activity, and explicit relationships. Activity includes only domains that publish epoch timestamps and labels each source. The graph links Session lineage, Job ownership or declared descendant Job ids, Team task ownership, Group membership, and Wait leaf inputs; it never derives an edge from a display name alone.

## Entity editors

Agent editors show authoritative identity, status, model when available, related Jobs and tasks, recent Team mailbox records, and supported controls. Subagent prompts use FIFO prompt delivery and never interrupt implicitly. Team messages retain the explicit quiet or wake choice. `Open Session` navigates to the owning DSH conversation. Registered Session-view actions open the corresponding presentation lens in the active pane or to the side without changing the outer conversation shell's selected view.

DSH already defines the Trajectory inspection handoff as an owner-provided `{ callId }` selection. Hosted views use that same owner-props path. GoodJob does not yet publish an inspect action because its current activity rows do not carry authoritative tool-call identities; adding such an action requires a DSH-owned `callId`, not a second selection channel.

Each Job editor owns its own observer cursor, bounded output buffer, search term, and copy state. Only a visible live editor follows output, and every page uses `jobs.observe`, so a second pane neither consumes nor changes the model-facing cursor.

Group, Wait, and task editors resolve their current projection on every render. Wait inspection is inert. Task reassignment uses the Team task revision returned by the live adapter.

## Rendering bounds

Job output is capped by `maxRenderedOutputChars`; truncation from either DSH retention or the local cap remains visible. General shows at most 30 timestamped activity entries, Agent mailbox views show the latest 20 matching messages, and hidden Job editors stop observing until focused. Explorer filtering and completed-item settings keep large settled inventories manageable without changing their domain retention.

## Deliberate limits

- The layout supports four panes but not nested editor groups, pinned tabs, tab drag-and-drop, or recently opened history.
- The Explorer filter is the quick-open affordance; GoodJob does not register global keyboard shortcuts or a command framework because the host does not expose conflict arbitration for them.
- Mailbox messages remain part of Agent tabs because Agent Teams does not expose a stable thread identity.
- A hosted registered view receives the public conversation-view owner props, but GoodJob exposes tool-call inspection only after an authoritative row provides the existing DSH `callId`.
- Activity omits task transitions and adapter refreshes that lack authoritative timestamps; it does not manufacture a total event order.
- Graph layout is a bounded clickable tree, not an inferred dependency engine or free-form canvas.
- Live recursive descendant and Team adapter details refresh on view entry, explicit refresh, and successful Team actions; GoodJob does not poll them continuously.
