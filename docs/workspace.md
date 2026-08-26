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

Every tab contains only a stable entity address: `general`, `agent:<sessionId>`, `job:<sessionId>:<jobId>`, `group:<groupId>`, `wait:<waitId>`, or `task:<taskId>`. Ordinary open focuses an existing tab; open-to-side may place the same address in another pane so two independently mounted views can compare it.

One to four panes share a simple horizontal, vertical, or two-by-two grid. A pane retains all open editor component instances while the workspace remains mounted and hides inactive ones, preserving search text, composers, and Job observer cursors without persisting domain values.

When `restoreWorkspace` is enabled, local storage records the presentation state under the root Session id. Refresh restores addresses and placement, then every editor resolves fresh values from DSH projections; Job status, Agent status, output, Wait settlement, task state, and mailbox messages are never restored from local storage.

## Explorer and General

The Explorer groups Agents, Jobs, Job Groups, Waits, and optional Team tasks. It renders concise authoritative state, supports text filtering and collapsible sections, and applies visibility settings without retaining copies of the listed objects.

General summarizes objective counts, failed Jobs, blocked tasks, optional-adapter availability, timestamped activity, and explicit relationships. Activity includes only domains that publish epoch timestamps and labels each source. The graph links Session lineage, Job ownership or declared descendant Job ids, Team task ownership, Group membership, and Wait leaf inputs; it never derives an edge from a display name alone.

## Entity editors

Agent editors show authoritative identity, status, model when available, related Jobs and tasks, recent Team mailbox records, and supported controls. Subagent prompts use FIFO prompt delivery and never interrupt implicitly. Team messages retain the explicit quiet or wake choice. `Open Session` navigates to the owning DSH conversation because the transcript renderer is not a public embeddable component; GoodJob does not maintain transcript state.

Each Job editor owns its own observer cursor, bounded output buffer, search term, and copy state. Only a visible live editor follows output, and every page uses `jobs.observe`, so a second pane neither consumes nor changes the model-facing cursor.

Group, Wait, and task editors resolve their current projection on every render. Wait inspection is inert. Task reassignment uses the Team task revision returned by the live adapter.

## Rendering bounds

Job output is capped by `maxRenderedOutputChars`; truncation from either DSH retention or the local cap remains visible. General shows at most 30 timestamped activity entries, Agent mailbox views show the latest 20 matching messages, and hidden Job editors stop observing until focused. Explorer filtering and completed-item settings keep large settled inventories manageable without changing their domain retention.

## Deliberate limits

- The layout supports four panes but not nested editor groups, pinned tabs, tab drag-and-drop, or recently opened history.
- The Explorer filter is the quick-open affordance; GoodJob does not register global keyboard shortcuts or a command framework because the host does not expose conflict arbitration for them.
- Mailbox messages remain part of Agent tabs because Agent Teams does not expose a stable thread identity.
- Activity omits task transitions and adapter refreshes that lack authoritative timestamps; it does not manufacture a total event order.
- Graph layout is a bounded clickable tree, not an inferred dependency engine or free-form canvas.
- Live recursive descendant and Team adapter details refresh on view entry, explicit refresh, and successful Team actions; GoodJob does not poll them continuously.
