# Operations Search

Global Session search uses DSH's own query authority — no GoodJob shadow index.

- **Authority**: `sessions.search(query, signal)` from the client runtime, backed server-side by the `@deepseek-ai/dsh-session-query` engine through the API proxy. Results arrive as `{sessionId, snippet}` pairs (≤ 20 per page; `hasMore` asks for refinement). Deployments without the search engine return an explicit error which GoodJob surfaces verbatim.
- **UI**: the Explorer hosts a submit-driven search panel with explicit `loading` / `partial` / `empty` / `unavailable` / `error` states. Requests are abortable; each submission cancels the previous one.
- **Identity rule**: a hit becomes navigable only when its session resolves against the workspace's displayed lineage (it opens that Agent tab). Unresolvable hits stay plain identifier+snippet rows rather than being guessed into entities.
- **Boundaries**: search is read-only, token-free, asynchronous, and never blocks workspace rendering. It searches DSH-visible message surfaces; GoodJob adds no indexing of its own.
