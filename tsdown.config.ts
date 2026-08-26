/**
 * GoodJob build: the Node face via tsc (package.json build script) and the
 * browser face here — one CJS closure-factory bundle matching the DSH client
 * module wire contract (`window.__ModuleLoader__.load({id, factory})`, externals
 * resolved through the injected require).
 */
import { defineConfig, type UserConfig } from 'tsdown'

/** Module-table specifiers GoodJob requests; everything else inlines. */
const EXTERNALS = [
  'react',
  'react/jsx-runtime',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-connection/client',
  '@deepseek-ai/dsh-client-locale/client',
  '@deepseek-ai/dsh-client-runtime/client',
  '@deepseek-ai/dsh-client-ui-slots',
]

/** Build one client face. */
export default defineConfig({
  // Bundle against committed package resolution; source-path mapping is a
  // typecheck/test concern only (see scripts/setup-dev.mjs).
  tsconfig: './tsconfig.json',
  name: 'dsh-goodjob/client',
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  // The wire path is lib/client.js (package.json exports), not .cjs.
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  deps: {
    neverBundle: specifier => EXTERNALS.includes(specifier),
    alwaysBundle: specifier => !EXTERNALS.includes(specifier),
  },
  banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify('dsh-goodjob')}, factory: (require) => {`,
  footer: 'return module.exports; } });',
} satisfies UserConfig)
