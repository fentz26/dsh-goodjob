# Development

## Quick start

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

`setup-dev` writes local-only files (`dsh.paths.json`, `tsconfig.dev.json`) and never changes what an installer sees; the committed manifest keeps only npm-resolvable dependencies. A fresh clone without those mappings falls back to normal node resolution — pointing at whatever `@deepseek-ai/*` copies are installed locally.

## Scripts

| Script | Purpose |
|---|---|
| `test` | vitest suites: folds, tools, lifecycle, browser rendering |
| `build` | typecheck (dev mapping if present, else standalone resolution) + tsdown for both faces |
| `build:dev` | tsc against the setup-dev mapped DSH declarations, then tsdown |
| `build:standalone` | tsc + tsdown without dev mappings; requires peer packages to be installed |
| `setup-dev` / `setup-dev:undo` | write/remove the local DSH source mappings |

There is no separate `lint` script; typecheck runs as part of every build path.

## Versioning

`VERSION` at the repository root is the single source of truth, using the calendar format `vYYYY.XX.XX` (or `vYYYY.XX`). `package.json`'s `version` field mirrors it in npm-valid form (no leading zeros). Releases pin install commands to published DSH versions that passed acceptance (currently `@deepseek-ai/dsh@0.1.1-rc.2`) — see [compatibility.md](compatibility.md).

## Build faces

tsdown emits two artifacts:

- `lib/index.js` — Node ESM host half. Externals: `@deepseek-ai/cordis`, `dsh-jobs`, `dsh-session`, `dsh-tools`, `schemastery`, `node:crypto`, `zod`.
- `lib/client.js` — browser bundle wrapped by DSH's module loader. Externals: `@deepseek-ai/dsh-client-ui-slots`, `react`, `react/jsx-runtime` only; Node builtins must never appear.

Both faces are committed to `lib/`; installs from GitHub need no build step.
