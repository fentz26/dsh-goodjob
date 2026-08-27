# Operations Delta (“What changed?”)

Operations Delta is a compact, deterministic summary of operational facts recorded since the previous visit to a GoodJob workspace. It appears in **General → What changed** and is derived entirely from state already owned by DeepSeek Harness or GoodJob's durable projections.

## Reference model

The current reference is **since last workspace visit**. GoodJob stores one presentation-local wall-clock timestamp per root Session in browser local storage. The first visit establishes the reference and deliberately shows no historical delta; **Mark reviewed** advances it to the current time.

DSH 0.1.1-rc.2 does not expose one cursor shared by all contributing projections, so the reference is necessarily hybrid: each candidate fact is compared using the authoritative timestamp recorded by its owning capability, then the merged result is ordered newest-first. Equal timestamps use stable item identity as a deterministic tie-breaker. The interval is `(last visit, generated at]`.

Only the reference timestamp is persisted. GoodJob does not persist domain snapshots, event copies, derived items, or a shadow index.

## Included facts

The view currently includes only facts with authoritative, client-visible timing:

- Job start and finish timestamps; failed/error finishes are failures.
- Wait and Job Group creation timestamps.
- Goal `updatedAt` changes; blocked goals need attention.
- Absolute/recurring schedule targets crossed during the interval while still undispatched.
- Agent Team mailbox queue timestamps when Teams is composed.

Clicking an item opens the corresponding GoodJob entity where one exists.

## Deliberate exclusions

Workflow outcomes, Wait settlement/cancellation, Job Group membership transitions, Team task/member transitions, and resolved attention reasons are omitted today because their client projections do not expose an unambiguous authoritative timestamp or common cursor. GoodJob does not infer one from refresh time, list position, elapsed duration, or phrases such as “probably stuck.”

The delta is a presentation aid, not a durable authority, audit log, scheduler, transcript store, or second event bus.
