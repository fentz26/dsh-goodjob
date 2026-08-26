/**
 * Host-half lifecycle against real Cordis: mount, register, dispose, remount.
 * The projection and settings seams are fakes implementing the same
 * structural faces GoodJob reads; the composition machinery itself is real
 * vendored Cordis.
 */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GoodJobService, { DEFAULTS } from '../src/index.ts'
import { Config as ConfigSchema } from '../src/config.ts'
import type { ProjectionRegistry } from '../src/types.ts'

/** Recorded registrations of one fake seam. */
interface Recording {
  /** Live keys with their disposers. */
  readonly registered: Map<string, () => void>
  /** Register spy. */
  readonly register: ReturnType<typeof vi.fn>
}

/** Build a fake projection registry recording its registrations. */
function fakeProjections(): ProjectionRegistry & Recording {
  const registered = new Map<string, () => void>()
  const register = vi.fn((definition: { key: string }): (() => void) => {
    const dispose = (): void => { registered.delete(definition.key) }
    registered.set(definition.key, dispose)
    return dispose
  })
  return { registered, register } as unknown as ProjectionRegistry & Recording
}

/** Build a fake settings registry recording its namespaces. */
function fakeSettings(): Recording {
  const registered = new Map<string, () => void>()
  const register = vi.fn((ns: string): (() => void) => {
    const dispose = (): void => { registered.delete(ns) }
    registered.set(ns, dispose)
    return dispose
  })
  return { registered, register }
}

describe('GoodJob host lifecycle', () => {
  let projections: ReturnType<typeof fakeProjections>
  let settings: ReturnType<typeof fakeSettings>

  beforeEach(() => {
    projections = fakeProjections()
    settings = fakeSettings()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** Mount one GoodJob fiber on a fresh context carrying both fakes. */
  async function mount(): Promise<Context> {
    const ctx = new Context()
    ctx.provide('sessionProjections', projections)
    ctx.provide('settings', settings)
    await ctx.plugin(GoodJobService)
    return ctx
  }

  it('registers the waits projection and settings namespace at load', async () => {
    await mount()
    expect(projections.register).toHaveBeenCalledWith(expect.objectContaining({ key: 'goodjob/waits' }))
    expect(settings.register).toHaveBeenCalledWith('goodjob', expect.anything())
    expect(projections.registered.has('goodjob/waits')).toBe(true)
    expect(settings.registered.has('goodjob')).toBe(true)
  })

  it('removes every registration when the plugin unloads and restores them on remount', async () => {
    const ctx = await mount()
    await ctx.fiber.dispose()
    expect(projections.registered.size).toBe(0)
    expect(settings.registered.size).toBe(0)

    // Remount re-registers without stale state: the disposal removed the
    // provided seams with the fiber, so a real profile restart re-composes
    // them before the bundle row mounts again.
    ctx.provide('sessionProjections', projections)
    ctx.provide('settings', settings)
    await ctx.plugin(GoodJobService)
    expect(projections.registered.has('goodjob/waits')).toBe(true)
    expect(settings.registered.has('goodjob')).toBe(true)
  })

  it('degrades with diagnostics when both seams are absent', async () => {
    const err = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    const ctx = new Context()
    await ctx.plugin(GoodJobService)
    expect(err).toHaveBeenCalledWith(expect.stringContaining('sessionProjections service not composed'))
    expect(err).toHaveBeenCalledWith(expect.stringContaining('settings service not composed'))
    await ctx.fiber.dispose()
    expect(projections.register).not.toHaveBeenCalled()
  })

  it('resolves schema defaults for absent config keys', async () => {
    await mount()
    const schema = settings.register.mock.calls[0]?.[1] as unknown as {
      (value?: object): Record<string, unknown>
    }
    expect(typeof schema).toBe('function')
    // The real schemastery schema resolves its own defaults.
    const resolved = (ConfigSchema as unknown as { (value?: object): Record<string, unknown> })({})
    expect(resolved).toEqual(DEFAULTS)
  })
})
