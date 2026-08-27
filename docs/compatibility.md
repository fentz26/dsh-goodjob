# Compatibility

| | |
|---|---|
| Verified minimum | DeepSeek Harness **0.1.1-rc.2** (published npm CLI): GoodJob installs and boots; Jobs observe, Job Groups, Waits projection, and Subagents work |
| Install channel | Web profile bundle via the `dsh plugin` command |
| Missing seams | Detected at load; GoodJob degrades with one boot-time diagnostic instead of failing the composition |

## Capability matrix

Status vocabulary: **available** means verified and usable at that floor; **optional** requires an independently composed owner service; **degraded** means GoodJob remains usable with an explicit fallback; **unavailable** means no owning public seam exists; **upstream-only** means implemented against a development-only seam and not claimable for the published floor.

The development column records the DSH main/development checkout tested during release hardening. Optional composition still controls optional services; it is not a promise that every checkout enables them by default.

| Capability | Published DSH 0.1.1-rc.2 | DSH current main / development checkout | Authority / note |
|---|---|---|---|
| GoodJob bundle/client/workspace | **available** | **available** | bundle composition, client roster, slots |
| Jobs observe | **available** | **available** | DSH Jobs service |
| Job Groups | **available** | **available** | GoodJob durable group events over DSH Job ids |
| Waits | **available** | **available** | DSH `wait/change` events; GoodJob reads the fold |
| recursive Subagents | **available** | **available** | DSH Session/subagent lineage |
| Goals | **available** | **available** | upstream durable goal projection; never mirrored |
| Workflows | **available** | **available** | durable `tool-workflow/*` events |
| Schedules | **available** | **available** | durable `schedule/change` events; read-only |
| Needs Attention | **available** | **available** | structural derivation from owned states |
| Operations Delta / What changed | **available** | **available** | authoritative timestamps plus a presentation-local anchor |
| Session Query | **optional**; explicit unavailable state if unmounted | **optional** | DSH session-query service; no GoodJob index |
| Usage | **available** | **available** | upstream durable `tokenUsage` projection |
| Agent Teams projection | **optional** | **optional** | durable Team events can be projected without live service |
| Agent Teams live controls | **optional**; Team Lead authorization required | **optional**; Team Lead authorization required | owning `agentTeams` service |
| Settings registry | **degraded**; card hidden and defaults used | **upstream-only**; activates when registry is composed | unreleased settings seam |
| hosted Session views / `SessionSlotHost` | **degraded**; explicit unavailable fallback | **upstream-only** | unreleased generic Session view host |
| Trajectory hosting | **degraded**; explicit unavailable fallback | **upstream-only** | relies on the generic Session view host; Trajectory remains owner |
| Artifacts authority | **unavailable** | **unavailable** | deferred until DSH exposes a generic deliverable authority |

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
