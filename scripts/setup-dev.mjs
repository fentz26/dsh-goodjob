#!/usr/bin/env node
/**
 * One-time local development setup.
 *
 * The committed manifest keeps only npm-resolvable devDependencies, so a plain
 * `pnpm add github:fentz26/dsh-goodjob` never touches them and never needs a
 * build step (lib/ is committed). Developing against real DeepSeek Harness
 * sources instead maps `@deepseek-ai/*` imports onto a side-by-side checkout:
 * this script generates `dsh.paths.json` (TypeScript `paths` + vitest alias
 * source), writes the npm devDependencies it needs into package.json, and
 * runs `pnpm install`.
 *
 * Usage:  node scripts/setup-dev.mjs [--undo]
 * Env:    DSH_HOME — DeepSeek Harness checkout (default ../deepseek-harness)
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** POSIX path of `target` relative to `from`. */
function relativePath(from, target) {
  return relative(from, target).split('\\').join('/')
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dshHomeEnv = process.env.DSH_HOME ?? '../deepseek-harness'
const dshHome = resolve(root, dshHomeEnv)
const undo = process.argv.includes('--undo')

/** Workspace-relative source roots inside the DeepSeek Harness checkout. */
const LINKED = {
  '@deepseek-ai/cordis': 'vendor/cordis',
  '@deepseek-ai/schemastery': 'vendor/schemastery',
  '@deepseek-ai/dsh-agent': 'packages/core/agent',
  '@deepseek-ai/dsh-brand': 'packages/util/brand',
  '@deepseek-ai/dsh-api-remotes': 'packages/api/remotes',
  '@deepseek-ai/dsh-host-apiproxy': 'packages/host/apiproxy',
  '@deepseek-ai/dsh-client-connection': 'packages/client/connection',
  '@deepseek-ai/dsh-client-locale': 'packages/client/locale',
  '@deepseek-ai/dsh-client-runtime': 'packages/client/runtime',
  '@deepseek-ai/dsh-client-ui-conversation': 'packages/client/ui-conversation',
  '@deepseek-ai/dsh-client-ui-settings-plugins': 'packages/client/ui-settings-plugins',
  '@deepseek-ai/dsh-client-ui-slots': 'packages/client/ui-slots',
  '@deepseek-ai/dsh-jobs': 'packages/jobs/jobs',
  '@deepseek-ai/dsh-session': 'packages/core/session',
  '@deepseek-ai/dsh-session-projection': 'packages/session/session-projection',
  '@deepseek-ai/dsh-tools': 'packages/core/tools',
  '@deepseek-ai/dsh-wait': 'packages/wait/wait',
}

/** Type-outlet subpaths that need their own declaration mapping. */
const SUBPATH_TYPES = {
  '@deepseek-ai/dsh-session/types':
    'packages/core/session/lib/types/types.d.ts',
  '@deepseek-ai/dsh-session-projection/types':
    'packages/session/session-projection/lib/types/types.d.ts',
}

/** npm packages that only exist for local development. */
const DEV_NPM = ['@testing-library/dom', '@testing-library/react', '@types/node', '@types/react', 'jsdom', 'react', 'react-dom', 'tsdown', 'typescript', 'vitest', 'zod']

if (!existsSync(dshHome) && !undo) {
  console.error(`setup-dev: DeepSeek Harness checkout not found at ${dshHome}`)
  console.error('setup-dev: clone https://github.com/deepseek-ai/deepseek-harness next to this')
  console.error('setup-dev: repository, or point DSH_HOME at an existing checkout.')
  process.exit(1)
}

const pathsFile = join(root, 'dsh.paths.json')
const devConfigFile = join(root, 'tsconfig.dev.json')

if (undo) {
  for (const file of [pathsFile, devConfigFile]) {
    if (existsSync(file)) {
      console.log(`setup-dev: removing ${file}`)
      execFileSync('rm', [file])
    }
  }
} else {
  /** Build one package's entries from its built type/runtime artifacts. */
  const entriesFor = (name, relative) => {
    const base = resolve(dshHome, relative)
    const candidates = [
      join(base, 'lib', 'index.js'),
      join(base, 'lib', 'index.mjs'),
      join(base, 'lib', 'src', 'index.ts'),
      join(base, 'src', 'index.ts'),
    ]
    const runtimeEntry = candidates.find(existsSync)
    if (runtimeEntry === undefined) {
      console.error(`setup-dev: ${name} has no built entry — run \`pnpm run build\` in the DeepSeek Harness checkout first`)
      process.exit(1)
    }
    const typeEntry = [
      join(base, 'lib', 'types', 'index.d.ts'),
      join(base, 'src', 'index.ts'),
    ].find(existsSync)
    if (typeEntry === undefined) {
      console.error(`setup-dev: ${name} has no type declarations — run \`pnpm run build\` in the DeepSeek Harness checkout first`)
      process.exit(1)
    }
    const entries = { [name]: [`${dshHomeEnv}/${relativePath(dshHome, runtimeEntry)}`] }
    typeEntries[name] = [`${dshHomeEnv}/${relativePath(dshHome, typeEntry)}`]
    const clientTypes = [
      join(base, 'lib', 'types', 'client', 'index.d.ts'),
      join(base, 'src', 'client', 'index.ts'),
    ].find(existsSync)
    if (clientTypes !== undefined) {
      // The browser face is type-only here: tests never import the
      // closure-factory bundle under Node.
      entries[`${name}/client`] = [`${dshHomeEnv}/${relativePath(dshHome, clientTypes)}`]
      typeEntries[`${name}/client`] = [`${dshHomeEnv}/${relativePath(dshHome, clientTypes)}`]
    }
    return entries
  }

  const paths = {}
  const typeEntries = {}
  for (const [name, relative] of Object.entries(LINKED)) {
    Object.assign(paths, entriesFor(name, relative))
  }
  for (const [specifier, target] of Object.entries(SUBPATH_TYPES)) {
    if (existsSync(resolve(dshHome, target))) typeEntries[specifier] = [`${dshHomeEnv}/${target}`]
  }
  writeFileSync(pathsFile, `${JSON.stringify({ compilerOptions: { paths } }, undefined, 2)}\n`)
  const devConfig = {
    extends: './tsconfig.json',
    compilerOptions: { paths: typeEntries },
  }
  writeFileSync(devConfigFile, `${JSON.stringify(devConfig, undefined, 2)}\n`)
  console.log(`setup-dev: wrote ${pathsFile} and ${devConfigFile}`)
}

// Keep the committed manifest clean: local-only npm deps are written here and
// left in place while developing.
const manifestPath = join(root, 'package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
manifest.devDependencies ??= {}
for (const name of DEV_NPM) {
  if (manifest.devDependencies[name] === undefined && manifest.dependencies?.[name] === undefined && !undo) {
    console.error(`setup-dev: ${name} missing from devDependencies; add it to the committed manifest`)
    process.exit(1)
  }
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, undefined, 2)}\n`)
execFileSync('pnpm', ['install'], { cwd: root, stdio: 'inherit' })
console.log(`setup-dev: done (${undo ? 'reverted' : 'configured'}). Use -p tsconfig.dev.json for tsc.`)
