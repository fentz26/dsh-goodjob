/** The committed browser artifact executes inside DSH's closure-factory loader. */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface ClientRegistration {
  id: string
  factory(require: (specifier: string) => unknown): { apply?: unknown; inject?: unknown }
}

describe('client bundle', () => {
  it('defines its CommonJS bindings inside the loader factory', () => {
    let registration: ClientRegistration | undefined
    const window = { __ModuleLoader__: { load(value: ClientRegistration): void { registration = value } } }
    const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
    Function('window', source)(window)
    const require = createRequire(import.meta.url)
    const exports = registration?.factory(specifier => require(specifier))
    expect(registration?.id).toBe('dsh-goodjob')
    expect(exports).toEqual(expect.objectContaining({ apply: expect.any(Function), inject: expect.any(Array) }))
  })
})
