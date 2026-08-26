# Installation

## Prerequisites

- Node ≥ 22.19 or ≥ 24, pnpm ≥ 10 on PATH (the `dsh plugin` command forwards to pnpm).
- Git credentials for `github.com` with access to this **private** repository. Standard tooling applies — `gh auth login` (git protocol https), or an SSH key configured for github.com. GoodJob stores no credentials anywhere.

Verified runtime matrix: Node 22.x (npm 10) and Node 26 (npm 11) both complete the full lifecycle; pnpm 11.22 was the forwarding target in all acceptance runs.

## Install into the web profile

```bash
npx -y @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add github:fentz26/dsh-goodjob
```

What happens:

1. The CLI initializes the profile on first use (`$DSH_HOME/profiles/web`).
2. The spec is forwarded to pnpm, which resolves `github:` sources through your normal Git credential path and pins the commit.
3. Because the manifest declares `dsh.bundle.patch`, the reconciler adds `dsh-goodjob` to the profile's bundle list — no manual patch editing.

Users without repository access see pnpm's authentication failure verbatim; there is no fallback and no token handling anywhere in GoodJob.

The dependency resolves as `git+https://github.com/fentz26/dsh-goodjob.git`. Installation uses only committed artifacts (`lib/index.js`, `lib/client.js`, declarations, `cordis.patch.yml`); no build step runs on install.

Then start the web profile as usual:

```bash
npx -y @deepseek-ai/dsh@0.1.1-rc.2 --profile web
```

and open the **GoodJob** conversation view in a Session. On DSH trees that compose the settings registry, the same configuration appears under **Settings → Plugins → GoodJob**.

## Upgrade / uninstall

```bash
npx -y @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web update dsh-goodjob   # upgrade in place
npx -y @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web remove dsh-goodjob   # uninstall
```

Uninstalling removes the dependency and bundle layer: after removal the profile's dependency list is empty, `node_modules` is clean, the lockfile has no GoodJob entries, and composing the profile yields no GoodJob layers. Reinstalling afterwards works without manual cleanup.

`wait/change` and `team/*` history remains owned by DSH. `goodjob/group-change` events carry the Session envelope's `ignorable: true` marker, so a DSH build that does not know GoodJob can skip that metadata safely; the referenced Jobs remain authoritative.
