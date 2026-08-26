# Schedules

Durable reminders authored through DSH's schedule domain (`@deepseek-ai/dsh-schedule`) are projected read-only.

- **Authority**: `schedule/change` v1 events (`create` / `delete` / `dispatch`) folded by `src/schedules.ts`; unknown operations, future versions, and malformed payloads are inert.
- **Record kinds** (exact upstream set): `at` (absolute RFC 3339 UTC target), `after` (relative seconds), `every` (fixed interval ≥ 5 minutes, anchor-aligned). A fixed-rate dispatch advances past missed occurrences using the authoritative accepted-at instant; one-shot dispatches mark the record dispatched.
- **Delivery state** is never stored: like upstream, GoodJob derives `scheduled`/`overdue` from the explicit absolute target plus the current clock at render time.
- **Delivery boundary**: reminders are session-local — the original session must be live. GoodJob surfaces this fact in the editor rather than implying cross-session scheduling.

GoodJob owns no scheduling authority: it projects records and navigates to their owning Session. Creating, editing, and cancelling remain with the model-facing tools.
