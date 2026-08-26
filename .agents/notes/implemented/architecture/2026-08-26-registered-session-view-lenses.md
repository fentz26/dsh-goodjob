# Agent Note: Registered Session views are workspace presentation lenses

Status: implemented

English | [中文](2026-08-26-registered-session-view-lenses.zh.md)

## Context

GoodJob can display several live operational contexts in internal tabs and panes. DSH conversation views, including Trajectory, are browser plugins registered in the shared `conversation.view` slot. They assemble presentation from Session state and own their rendering behavior; they are not Agent, Job, Wait, or task records.

The conversation shell originally rendered a registered view only for its currently selected Session. Hosting a sibling view for another Agent inside GoodJob therefore required an explicit-Session rendering entry point, but copying a view component or its state would create a second implementation and bypass normal registration lifecycle.

## Decision

GoodJob represents any registered conversation view as `{ kind: 'session-view', sessionId, viewId }`, keyed as `view:<sessionId>:<viewId>`. This is presentation state. Workspace persistence stores only those identifiers and pane placement.

The DSH client renderer provides a generic explicit-Session slot host. GoodJob asks that host to resolve the existing `conversation.view` registration by `viewId` and render it under the addressed Session's ordinary provider and injection path. GoodJob discovers registrations from the shared slot registry and neither registers aliases nor imports view implementations.

Trajectory remains entirely owned by `@deepseek-ai/dsh-client-ui-trajectory`. GoodJob does not reproduce its snapshot builder, definitions, timing, search, folding, virtual rows, request headers, or inspection state. The existing conversation-view owner props remain the inspection path when an authoritative GoodJob projection can supply a tool-call `callId`.

Missing and unloaded registrations render a defined unavailable state. Re-registration recovers the retained tab. Opening or restoring a Session view observes Session history but does not select the outer shell view, send a prompt, or request model inference.

## Consequences

Any present or future `conversation.view` plugin can appear as an Agent lens without a GoodJob-specific entity kind. Two panes may host the same registration independently when that view supports multiple instances, and different Agents can use the same view simultaneously.

Domain relationships and graph edges remain limited to authoritative operational entities. A Session view may be offered as an Agent action, but it is not a graph node or execution dependency.

Older DSH clients without the generic host can still load GoodJob; only hosted Session-view content is unavailable. No hosted snapshot or execution state enters local workspace storage.
