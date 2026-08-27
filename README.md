# GoodJob

**Background jobs, waits, and agent operations for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).**

GoodJob is an out-of-tree DeepSeek Harness plugin (a *bundle*). It gives you an IDE-style operations workspace over Jobs, durable Job Groups, Waits, recursive Subagents, and optional Agent Teams without creating a second scheduler, task board, event bus, transcript store, or conversation surface. Execution remains owned by the DSH capability that started it.

## Install

```bash
npx -y @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add github:fentz26/dsh-goodjob
```

Then start the web profile as usual:

```bash
npx -y @deepseek-ai/dsh@0.1.1-rc.2 --profile web
```

Upgrade / uninstall:

```bash
npx -y @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web update dsh-goodjob   # upgrade in place
npx -y @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web remove dsh-goodjob   # uninstall
```

Requires Node ≥ 22.19 or ≥ 24, pnpm ≥ 10 on PATH, and Git (GitHub is reachable anonymously — this repository is public). GoodJob stores no credentials anywhere. Full installation mechanics: [docs/installation.md](docs/installation.md).

## Main features

- **Operations workspace** — a native conversation view with an Explorer, stable tabs, and up to four split panes over Jobs, Groups, Waits, Subagents, and Teams.
- **Goals** ([docs](docs/features/goals.md)) — the Session's durable objective with phases, rounds, and blocked reasons.
- **Workflows** ([docs](docs/features/workflows.md)) — durable workflow runs and member outcomes, exactly as the tool records them.
- **Schedules** ([docs](docs/features/schedules.md)) — durable reminders projected read-only with explicit overdue state.
- **Needs Attention** ([docs](docs/features/attention.md)) — deterministic blockers/failures derived from authoritative states, plus "Why idle?" on agents.
- **What changed?** ([docs](docs/features/delta.md)) — a deterministic since-last-visit delta from authoritative timestamps; only its presentation-local reference timestamp is stored.
- **Operations search** ([docs](docs/features/search.md)) — live-preferred Session search through DSH's own query engine; no shadow index.
- **Usage** ([docs](docs/features/usage.md)) — exact token accounting from the durable `tokenUsage` projection; never a derived price.
- **Artifacts** ([docs](docs/features/artifacts.md)) — deferred until DeepSeek Harness exposes a deliverable authority.
- **Jobs** — live status, exact elapsed time, bounded searchable output; reading logs never advances the model-facing cursor.
- **Job Groups** — durable Session-local labels over existing Job ids with exact member states; a compact `job_group` tool for fan-out / fan-in.
- **Waits** — durable wait intents folded read-only from `wait/change` Session events.
- **Subagents** — every descendant with lineage, activity, model, related Jobs, and navigation actions.
- **Agent Team** (optional) — projects the Team roster, tasks, and mailbox when Agent Teams is composed.
- **Settings → Plugins → GoodJob** — visibility controls for every section on DSH trees that compose the settings registry.

## Compatibility

Verified minimum: DeepSeek Harness **0.1.1-rc.2** — GoodJob installs, boots, and its core features work there; two capabilities degrade gracefully until upstream ships their seams. Details and known launcher issues: [docs/compatibility.md](docs/compatibility.md).

## Technical documentation

| Document | Contents |
|---|---|
| [docs/installation.md](docs/installation.md) | prerequisites, what the installer does, auth behavior |
| [docs/architecture.md](docs/architecture.md) | workspace, host half, model-facing tools, limitations, repository layout |
| [docs/compatibility.md](docs/compatibility.md) | capability matrix, graceful degradation, launcher issue |
| [docs/workspace.md](docs/workspace.md) | workspace identity, persistence, projection, rendering reference |
| [docs/development.md](docs/development.md) | local development against DSH sources |

Security reports follow the coordinated process in [SECURITY.md](SECURITY.md) — please use GitHub Private Vulnerability Reporting or the contact address there; do not open public issues for unpatched vulnerabilities.

## Contact

Questions and feedback: [contact@fentz.dev](mailto:contact@fentz.dev)

## License

MIT
