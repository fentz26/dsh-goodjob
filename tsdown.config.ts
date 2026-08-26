/**
 * GoodJob build: two faces.
 *
 * - Browser: one CJS closure-factory bundle matching the DSH client module
 *   wire contract (`window.__ModuleLoader__.load({id, factory})`, externals
 *   resolved through the injected require).
 * - Node: the host half as ESM at lib/index.js, externals resolved from the
 *   running DeepSeek Harness installation.
 *
 * Type declarations come from tsc (`build` script); source-path mapping onto
 * a DeepSeek Harness checkout is a typecheck/test concern only
 * (scripts/setup-dev.mjs).
 */
import { defineConfig, type UserConfig } from 'tsdown'

/** Module-table specifiers GoodJob requests; everything else inlines. */
const CLIENT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-connection/client',
  '@deepseek-ai/dsh-client-locale/client',
  '@deepseek-ai/dsh-client-runtime/client',
  '@deepseek-ai/dsh-client-ui-slots',
]

/** Every bare specifier the Node face keeps external. */
const NODE_EXTERNAL = specifier => specifier.startsWith('@deepseek-ai/') || specifier === 'zod'

const client: UserConfig = {
  name: 'dsh-goodjob/client',
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  // Bundle against committed package resolution; the dev paths file is a
  // typecheck/test concern only.
  tsconfig: './tsconfig.json',
  deps: {
    neverBundle: specifier => CLIENT_EXTERNALS.includes(specifier),
    alwaysBundle: specifier => !CLIENT_EXTERNALS.includes(specifier),
  },
  banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify('dsh-goodjob')}, factory: (require) => {`,
  footer: 'return module.exports; } });',
  // The wire paths are lib/index.js and lib/client.js (package.json exports).
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
}

const node: UserConfig = {
  name: 'dsh-goodjob/node',
  entry: { index: 'src/index.ts' },
  outDir: 'lib',
  format: 'esm',
  platform: 'node',
  dts: false,
  sourcemap: true,
  clean: false,
  tsconfig: './tsconfig.json',
  deps: { alwaysBundle: specifier => !NODE_EXTERNAL(specifier) },
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
}

export default [node, client]
