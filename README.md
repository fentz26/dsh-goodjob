# GoodJob

**Background jobs, waits, and agent operations for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).**

GoodJob is an out-of-tree DeepSeek Harness plugin (a *bundle*). It gives you an IDE-style operations workspace over Jobs, durable Job Groups, Waits, recursive Subagents, and optional Agent Teams without creating a second scheduler, task board, event bus, transcript store, or conversation surface. Execution remains owned by the DSH capability that started it.

```bash
npx @deepseek-ai/dsh plugin --profile web add github:fentz26/dsh-goodjob
```

---

## What GoodJob does

### Operations workspace (web profile)

The native `GoodJob` conversation view opens on `General`, with an Explorer, stable internal tabs, and one to four split panes. Ordinary open focuses an existing entity tab; **Open to side**, split right/down, move, close, and reopen operate only on presentation state. On narrow screens the Explorer collapses and the focused pane remains available. Agent tabs also discover sibling DSH `conversation.view` registrations and can host any of them for that Session; Trajectory remains owned by its plugin rather than becoming GoodJob data.

`General` answers what is happening now with objective counts, attention state, timestamped activity, and a clickable relationship graph. Every value is projected from the capabilities below:

- **Agents and Subagents** — every descendant with lineage depth, mode, activity, live model when available, related Job ids, Team mailbox activity, and supported actions. **Open Session** navigates to the existing DSH conversation; **Message** uses FIFO prompt delivery and **Interrupt** remains explicit.
- **Jobs** — background Jobs across the displayed Agent lineage with live status, exact elapsed time, bounded searchable output, and one independent `jobs.observe` cursor per editor instance. Reading logs never advances the model-facing cursor.
- **Job Groups** — durable Session-local labels over existing Job ids. A group shows exact member states and settled counts, never estimated progress. A Job may belong to several groups.
- **Waits** — durable wait intents folded read-only from the `wait/change` Session events their owning capability logs: mode (`any`/`all`), per-leaf provider and settlement state, winning leaf for admitted races, and lifecycle (`waiting` → `ready` → `resumed`, or `cancelled`).
- **Agent Team** — shown only when Agent Teams is composed. It projects the Team-owned roster, tasks, and mailbox, with Team Lead-authorized quiet/wake messages, replies, interrupt, task navigation, and revision-checked reassignment controls. Human messages are labeled `Human via GoodJob, authorized as Team Lead` in the recipient transcript.

Workspace layout persistence stores only entity addresses, tabs, panes, and Explorer state in local storage. A refresh resolves fresh DSH projections and never restores execution state. Opening the workspace, General, or an entity editor never wakes an Agent and never spends tokens. See [the workspace architecture](docs/workspace.md) for identity, projection, observer, and rendering details.

### Settings → Plugins → GoodJob

A card in the existing configurable-plugins tab controls visibility for Jobs, Groups, Waits, Subagents, optional Team tasks/mailbox, completed Explorer rows, activity, and graph sections, plus workspace restoration and job-output following. Writes use the standard revision-checked settings API.

### Model-facing Job Groups

The single `job_group` tool keeps the model surface compact:

- `create`, `add`, `remove`, `rename`, `delete`, and `list` mutate or inspect durable grouping metadata.
- `wait` compiles the group's current Job ids into the existing `wait_create` semantics with `job` leaves and `any` or `all` mode.

The tool accepts only Jobs already started through their owning producer, such as background Bash or subagent delegation. It does not launch, stop, kill, own, or reschedule work. Fan-out is the normal sequence of background starts followed by one group creation; fan-in is one group wait.

### Host half

The bundle row mounts one service that:

1. registers the `goodjob` settings namespace,
2. detects its required capability seams at load and prints actionable diagnostics when an installation lacks them, and
3. installs pure `goodjob/waits`, `goodjob/groups`, and `goodjob/teams` projection units,
4. registers the compact `job_group` tool and `team-task` Wait provider when their owning registries are present, and
5. mounts a loopback-only RPC channel for recursive descendant reads and optional Team controls.

Every registration is an effect on the service fiber: uninstalling or disabling GoodJob removes the projection key, the settings namespace, the native view, and the card together, and leaves durable DSH history untouched.

## Compatibility

| | |
|---|---|
| Requires | A DeepSeek Harness tree carrying durable Waits, `jobs.observe`, generic Connection RPC, and ignorable plugin Session append metadata |
| Install channel | Web profile bundle via the `dsh plugin` command |
| Missing seams | Detected at load; GoodJob degrades with a diagnostic naming this file instead of failing the composition |

No released DeepSeek Harness version ships this complete floor yet. Run the web profile from a source checkout containing these public seams. Agent Teams remains optional: its absence removes the Team section and controls without affecting Jobs, Groups, Waits, or Subagents.

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

Uninstalling removes the dependency and bundle layer. `wait/change` and `team/*` history remains owned by DSH. `goodjob/group-change` events carry the Session envelope's `ignorable: true` marker, so a DSH build that does not know GoodJob can skip that metadata safely; the referenced Jobs remain authoritative.

## Limitations

- **No Job Stop/Kill.** GoodJob does not claim process ownership or expose an unsafe termination shortcut.
- **No batch launcher.** Launch requests continue through each producer's existing approval, sandbox, working-directory, environment, and cleanup path.
- **Optional Teams runtime.** Durable Team events can be projected without the service, but live controls require the Team Lead session and Agent Teams service to be composed.
- **Waits are read-only here.** Creating waits stays with the model-facing tools (`wait_create` / `wait_list` / `wait_cancel`); GoodJob only visualizes intent.
- Team-task completion is the only additional Wait provider in v0.2. Message and subagent-report waits are deferred until their owning services expose an unambiguous from-now cursor.
- **Transcript navigation plus registered lenses.** Agent tabs navigate to the owning Session for the standard transcript and may host public registered `conversation.view` entries through DSH's generic explicit-Session slot host. GoodJob never imports or copies Trajectory internals.
- **Simple editor groups.** The workspace supports four panes but not nested editor groups, pinned tabs, drag-and-drop, or recently opened history.
- **No synthetic activity.** Task transitions without authoritative timestamps, adapter refreshes, and relationships not represented by ids are omitted.

## Development

```bash
pnpm install
pnpm test          # folds, adapters, lifecycle, and browser components
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
src/index.ts        host half: lifecycle and projection registration
src/config.ts       shared config schema + defaults
src/fold.ts         pure wait/change fold (read-only replay semantics)
src/groups.ts       durable Job Groups and the job_group tool
src/teams.ts        Team projection and team-task Wait provider
src/rpc.ts          recursive descendants and Team controls
src/types.ts        wire values + structural faces of consumed DSH seams
src/client/         browser half: entry, workspace state/view, projections, settings card
docs/workspace.md   workspace ownership, identity, persistence, and rendering reference
scripts/setup-dev.mjs  local link setup for development against DSH sources
tests/              vitest suites (folds, tools, lifecycle, browser rendering)
lib/                committed build output — installs need no build step
```

## License

MIT
