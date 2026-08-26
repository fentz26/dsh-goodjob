#!/usr/bin/env node
/**
 * Build runner: typecheck against DeepSeek Harness declarations when
 * scripts/setup-dev.mjs has configured them (tsconfig.dev.json), otherwise
 * against the standalone resolution, then emit both bundle faces with tsdown.
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const tscConfig = existsSync(new URL('../tsconfig.dev.json', import.meta.url))
  ? 'tsconfig.dev.json'
  : 'tsconfig.json'
console.log(`build: tsc -p ${tscConfig}`)

const tsc = spawnSync('pnpm', ['exec', 'tsc', '-p', tscConfig], { stdio: 'inherit' })
if (tsc.status !== 0) process.exit(tsc.status ?? 1)

const tsdown = spawnSync('pnpm', ['exec', 'tsdown'], { stdio: 'inherit' })
process.exit(tsdown.status ?? 1)
