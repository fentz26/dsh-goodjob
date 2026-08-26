# Compatibility

| | |
|---|---|
| Verified minimum | DeepSeek Harness **0.1.1-rc.2** (published npm CLI): GoodJob installs and boots; Jobs observe, Job Groups, Waits projection, and Subagents work |
| Install channel | Web profile bundle via the `dsh plugin` command |
| Missing seams | Detected at load; GoodJob degrades with one boot-time diagnostic instead of failing the composition |

## Capability matrix

| Capability | Published DSH 0.1.1-rc.2 | Unreleased DSH (`feat/session-view-host`) | Requirement |
|---|---|---|---|
| Bundle load + service mount | ✅ verified by boot | ✅ | base |
| Client bundle serve (`/plugins/dsh-goodjob/client.js`) | ✅ HTTP 200 | ✅ | base |
| Workspace UI (tabs/split/restore) | ✅ loads; restore is local-storage only | ✅ | slots API `entries` / `subscribe` / `getVersion` — all present in rc.2 |
| Jobs observe | ✅ | ✅ | jobs seams present in rc.2 |
| Job Groups projection | ✅ registered (`sessionProjections` composed in rc.2) | ✅ | session-projection registry |
| Waits fold/projection | ✅ registered | ✅ | session-projection registry |
| Subagents | ✅ | ✅ | sessions/subagent seam |
| `job_group` tool / team-task Wait provider | ✅ attaches lazily when registries present | ✅ | tools/jobs/waits registries |
| Agent Teams (live controls) | ⚠️ degrades: projected state shows `available: false` | ⚠️ same unless Agent Teams is composed | optional `agentTeams` service |
| Settings card (Settings → Plugins) | ❌ hidden — settings registry absent in rc.2; single boot diagnostic; defaults used | ✅ activates automatically | unreleased settings seam |
| Hosted Session views / Trajectory hosting | ❌ prop absent → explicit "View unavailable" fallback UI; plugin keeps running | ✅ host injected via props | unreleased session slot host |

## Graceful degradation on published 0.1.1-rc.2

Two capabilities are unavailable because their owning DSH seams are unreleased:

- **Settings → Plugins card** — rc.2 does not compose a settings registry. The card is hidden; every other feature keeps its built-in defaults. One concise diagnostic names this at web-profile startup:
  ```
  goodjob: settings not composed at load — running without its configuration card unless it mounts later. …
  ```
- **Hosted Session views (Trajectory hosting)** — rc.2 has no session slot host and exports no `SessionSlotHostComponent`. A tab opened for another plugin's registered `conversation.view` shows an explicit "View unavailable" notice instead of the hosted view. The GoodJob workspace itself is unaffected.

Both activate automatically on any DSH tree that composes the corresponding seams (upstream branches carrying the settings registry and the session slot host). Agent Teams remains optional regardless: its absence removes the Team section and controls without affecting Jobs, Groups, Waits, or Subagents.

Diagnostics are emitted once per missing seam at load — never spammed per request.

## Known launcher issue

Some environments cannot execute the bare-spec launcher — `npx @deepseek-ai/dsh …` hangs and eventually aborts while npm resolves the unpinned spec from the registry (reproduced on npm 10/Node 22 and npm 11/Node 26; ~230 s then an out-of-memory abort inside the resolution layer).

This is an npx/npm resolution problem, not a packaging defect in the CLI (the pinned package tarball has a valid `bin`, shebang, exec bit, and installs/runs correctly), and it does not involve GoodJob. Pin until the upstream issue is resolved:

```bash
npx -y @deepseek-ai/dsh@0.1.1-rc.2 …
```

Do not conflate this with plugin distribution: with the pinned spec, GitHub installation and the whole lifecycle work end-to-end.
