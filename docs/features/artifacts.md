# Artifacts

**Status: deferred — no upstream authority exists yet.**

A full audit of current DeepSeek Harness (published rc.2 and source) finds no generic artifact/output/deliverable seam: workflows carry member outcomes and a terminal reason but persist no structured return value, subagent reports are transcript-owned, and there is no deliverable registry, event type, or service.

GoodJob deliberately does not:

- scan filesystems and call files artifacts,
- log copies of message content as durable artifacts,
- invent a GoodJob artifact registry before any producer would reference it.

Candidate authorities to revisit when they materialize upstream: a generic artifact/event seam, workflow structured outputs with durable identity, A2A Artifacts (remote), or an explicit registration channel intended for trusted plugins. When one lands, this document and the dependency graph will gain producer relationships (`Goal → Artifact`, `Workflow → Artifact`, `Agent → Artifact`) sourced authoritatively — see the governing rules in [architecture](../architecture.md).
