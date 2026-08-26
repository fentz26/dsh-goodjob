# Agent Note: Entity-addressed IDE workspace over authoritative operations state

Status: implemented

English | [中文](2026-08-26-ide-operations-workspace.zh.md)

## Problem

GoodJob's session-header popover could list Jobs, Waits, Subagents, Groups, and Team state, but each detail displaced the others and one expanded Job owned the entire output view. Concurrent autonomous work requires several live contexts to remain visible together without promoting GoodJob into a scheduler, transcript store, task authority, or event bus.

## Decision

GoodJob occupies the native DSH `conversation.view` seat and presents an internal workspace whose stable tab addresses contain only authoritative ids. `general`, `agent:<sessionId>`, `job:<sessionId>:<jobId>`, `group:<groupId>`, `wait:<waitId>`, and `task:<taskId>` resolve current values from DSH mirrors, Session projections, or optional adapters on every render. `view:<sessionId>:<viewId>` addresses a registered presentation lens and stores no hosted snapshot.

The client persists only open addresses, pane placement, active tabs, and Explorer collapse state under the root Session id. It never persists status, output, Wait settlement, task fields, mailbox messages, or execution state. Ordinary open focuses an existing address, while open-to-side may mount the same address in another pane. Each mounted Job editor owns an independent `jobs.observe` cursor and bounded browser buffer, so comparison views remain non-consuming and cannot advance the model-facing cursor.

General is a read-only composition of objective counts, timestamped events, attention conditions, and explicit relationships. Graph edges require Session lineage, Job ownership or declared related ids, Group membership, Team task ownership, or Wait leaf ids. Missing timestamps or relationships produce omission rather than a synthetic activity item or inferred edge.

DSH conversation rendering remains Session-owned. Agent editors navigate through the existing Session service for the standard transcript and use DSH's generic registered-view host for sibling `conversation.view` lenses instead of copying messages or importing a view implementation. Subagent prompts use the existing FIFO delivery API, interruption stays separate, and Team controls retain quiet/wake delivery and revision-checked task reassignment.

## Alternatives considered

**Browser tabs or windows for each entity.** They split layout, focus, observer, and refresh state across browsing contexts and cannot provide one coherent General or graph projection.

**A GoodJob execution and transcript store.** It would duplicate authoritative Session, Jobs, Wait, and Team state, introduce reconciliation failures, and make UI refresh capable of reviving stale execution values.

**One global Job observer cursor.** It would couple unrelated panes and risk turning human log inspection into consumption. Per-editor cursors preserve the `jobs.observe` contract.

**A generic command and editor-group framework.** DSH does not expose conflict arbitration for global shortcuts, and the operational requirement is satisfied by filtering, stable tabs, and up to four simple panes.

## Consequences

The workspace supports concurrent Agent, Job, Group, Wait, and Team task inspection with client-only restoration and no inference on observation. Hidden editors retain local controls while mounted, but hidden Job views stop following output until focused. The simple grid does not provide nested groups, pinned tabs, drag-and-drop, or recently opened history. Mailbox content remains inside Agent tabs until Agent Teams exposes a stable thread identity, and live recursive descendant or Team adapter details refresh explicitly instead of through continuous polling.
