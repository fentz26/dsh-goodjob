# GoodJob

**Background jobs, waits, and agent operations for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).**

GoodJob is an out-of-tree DeepSeek Harness plugin (a *bundle*). It gives you one operations view over the background work your agents already do — Jobs, Waits, and Subagents — without creating any second authority, event bus, task board, or conversation surface. Everything you see is projected from the services that already own the data, and everything you click goes through the APIs those services already authorize.

```bash
npx @deepseek-ai/dsh plugin --profile web add github:fentz26/dsh-goodjob
```

---

## What GoodJob does

### Operations view (web profile)

A `GoodJob` action in every session header opens a three-section panel:

- **Subagents** — each direct child of the current session with its label, delivery mode (`continuable` / `one-shot`), and driver activity. Per row: **Open** (the existing child transcript — no duplicate session), **Message** (send an additional prompt through the existing continuable-prompt RPC; the host queues it FIFO), and **Interrupt** (explicit confirmation; ends only the current turn, the session stays continuable).
- **Jobs** — the session's background jobs with live status and elapsed time. **Logs** expands one page of output fetched through the non-consuming `jobs.observe` API: reading logs never advances the model-facing cursor and causes zero model inference.
- **Waits** — durable wait intents folded read-only from the `wait/change` Session events their owning capability logs: mode (`any`/`all`), per-leaf provider and settlement state, winning leaf for admitted races, and lifecycle (`waiting` → `ready` → `resumed`, or `cancelled`).

Opening the panel and reading anything in it never wakes an agent and never spends tokens.

### Settings → Plugins → GoodJob

A card in the existing configurable-plugins tab edits four toggles (show jobs / subagents / waits, auto-follow job output) through the standard settings API, revision-checked. The plugin identity lives in Settings → Plugins → Plugin Inventory; repository metadata does not clutter the form.

### Host half

The bundle row mounts one service that:

1. registers the `goodjob` settings namespace,
2. detects its required capability seams at load and prints actionable diagnostics when an installation lacks them, and
3. installs the `goodjob/waits` session-projection unit — a pure fold over `wait/change` events — so wait state rides the existing projection feed to every browser observer.

Every registration is an effect on the service fiber: uninstalling or disabling GoodJob removes the projection key, the settings namespace, the header action, and the card together, and leaves durable DSH history untouched.

## Compatibility

| | |
|---|---|
| Requires | A DeepSeek Harness tree carrying `@deepseek-ai/dsh-wait` (durable agent waits) and the non-consuming `jobs.observe` API |
| Install channel | Web profile bundle via the `dsh plugin` command |
| Missing seams | Detected at load; GoodJob degrades with a diagnostic naming this file instead of failing the composition |

No released DeepSeek Harness version ships both seams yet: run the web profile from a source checkout of `deepseek-harness` main that contains them. GoodJob deliberately declares **no upstream patch requirement** — everything it reads is a public seam (session projections, jobs registry mirror, subagent control RPCs, settings namespaces, client slots).

## Installation

Prerequisites:

- Node ≥ 22.19 or ≥ 24, pnpm ≥ 10 on PATH (the `dsh plugin` command forwards to pnpm).
- Git credentials for `github.com` with access to this **private** repository. Standard tooling applies — `gh auth login` (git protocol https), or an SSH key configured for github.com. GoodJob stores no credentials anywhere.

Install into the web profile:

```bash
npx @deepseek-ai/dsh plugin --profile web add github:fentz26/dsh-goodjob
```

What happens: the CLI initializes the profile on first use, forwards the spec to pnpm (which resolves `github:` sources through your normal git credential path), then reconciles the profile's layer list against installed packages — GoodJob joins because its manifest declares `dsh.bundle.patch`. Users without repository access see pnpm's authentication failure verbatim; no fallback, no token handling.

Then start the web profile as usual:

```bash
npx @deepseek-ai/dsh --profile web
```

and confirm **Settings → Plugins** shows the GoodJob card.

### Upgrade / uninstall

```bash
npx @deepseek-ai/dsh plugin --profile web update dsh-goodjob   # upgrade in place
npx @deepseek-ai/dsh plugin --profile web remove dsh-goodjob   # uninstall
```

Uninstalling removes the dependency and the bundle layer; the next start composes stock DSH. Session logs written while GoodJob was enabled stay readable — `wait/change` events are owned by `@deepseek-ai/dsh-wait`, not by GoodJob.

## Limitations

- **Read-mostly by design.** Job Stop/Kill is intentionally absent: the current producer-settlement semantics around `kill()` are still being settled upstream, and a human stop button must not leave an agent believing a stopped job is still running.
- **Direct children only.** The agents section lists the current session's direct catalog children; descendant navigation uses the existing lineage UI.
- **No Agent Teams adapter yet.** Team roster/mailbox/task-board projection is planned as an optional adapter loaded only when experimental Agent Teams is composed; base GoodJob has no experimental dependency.
- **Waits are read-only here.** Creating waits stays with the model-facing tools (`wait_create` / `wait_list` / `wait_cancel`); GoodJob only visualizes intent.
- No completion percentages anywhere: status comes from real registries, elapsed time from real timestamps.

## Development

```bash
pnpm install
pnpm test          # fold + host-lifecycle suites (vitest)
pnpm run build     # tsc declarations + browser closure-factory bundle
```

Building and testing against real DeepSeek Harness types requires a side-by-side checkout that has been built (`pnpm run build` inside it):

```bash
git clone https://github.com/deepseek-ai/deepseek-harness ../deepseek-harness   # or set DSH_HOME
pnpm run setup-dev          # maps @deepseek-ai/* onto that checkout's built artifacts
pnpm test                   # fold + lifecycle suites through real DSH types
pnpm run build:dev          # typecheck against DSH declarations, then bundle
pnpm run setup-dev:undo     # restore the standalone configuration
```

`setup-dev` writes local-only files (`dsh.paths.json`, `tsconfig.dev.json`) and never changes what an installer sees; the committed manifest keeps only npm-resolvable dependencies.

Repository layout:

```
cordis.patch.yml    the bundle patch — one composition row (dual-face package)
src/index.ts        host half: service, seam detection, waits projection
src/config.ts       shared config schema + defaults
src/fold.ts         pure wait/change fold (read-only replay semantics)
src/types.ts        wire values + structural faces of consumed DSH seams
src/client/         browser half: entry, operations view, settings card
scripts/setup-dev.mjs  local link setup for development against DSH sources
tests/              vitest suites (fold semantics, host lifecycle)
lib/                committed build output — installs need no build step
```

## License

MIT
