# Usage

Token accounting comes straight from DSH's token-meter projection.

- **Authority**: rc.2's built-in `tokenUsage` Session projection — `{uncachedInputTokens, outputTokens, cacheReadTokens, cacheWriteTokens}` — accumulated by `@deepseek-ai/dsh-token-meter` over the complete durable log. Compaction and paging cannot change any figure because it rides durable state, exactly like the conversation's own stats line.
- **Display**: General shows one **Usage** section with exactly the positive fields, separated (`input (uncached)` never summed with cache fields). Compact forms (`84k`) are display-only; exact counts ride tooltips. `cache write = 0` rows are omitted rather than shown as zeros.
- **No currency**: there is no authoritative pricing field upstream, so GoodJob never derives monetary cost.
- **Scope**: figures are self-per-Session. Descendant totals are not exposed by current client seams, so they are explicitly absent instead of being estimated; aggregate only through explicit relationships once such seams exist.

Toggle: Settings → Plugins → GoodJob → *Usage panel* (`showUsage`, default on; hidden gracefully when the settings registry is absent).
