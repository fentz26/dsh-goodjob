/**
 * Fold semantics for the GoodJob waits view. These tests pin the read-only
 * replay contract against the `wait/change` vocabulary `@deepseek-ai/dsh-wait`
 * logs: create/resolve/cancel/dispatch, any-race winner, all-mode fan-in,
 * duplicate resolves, and version tolerance.
 */
import { describe, expect, it } from 'vitest'
import { applyWaitEvent, isWaitChange } from '../src/fold.ts'
import type { GoodJobWaitView } from '../src/types.ts'

/** One create event with two job leaves in `any` mode. */
const createAny = {
  type: 'wait/change',
  version: 1,
  operation: 'create',
  wait: {
    id: 'w1',
    createdAt: 100,
    expression: {
      mode: 'any',
      conditions: [
        { provider: 'job', input: { job_id: 'a' } },
        { provider: 'job', input: { job_id: 'b' } },
      ],
    },
  },
} as const

describe('wait/change fold', () => {
  it('narrows wait/change records and ignores foreign events', () => {
    expect(isWaitChange({ type: 'agent/created' })).toBe(false)
    expect(isWaitChange(createAny)).toBe(true)
  })

  it('keeps the state reference for non-wait events', () => {
    const state = { waits: [] as readonly GoodJobWaitView[] }
    expect(applyWaitEvent(state, { type: 'session/created' })).toBe(state)
  })

  it('ignores unknown versions so an old viewer stays inert', () => {
    const state = { waits: [] as readonly GoodJobWaitView[] }
    const future = { ...createAny, version: 2 }
    expect(applyWaitEvent(state, future)).toBe(state)
  })

  it('creates a view with pending leaves and admits the first any leaf as winner', () => {
    let state = applyWaitEvent(undefined, createAny)
    expect(state?.waits).toHaveLength(1)
    const view = state?.waits[0]
    expect(view?.status).toBe('pending')
    expect(view?.leaves.map(leaf => leaf.provider)).toEqual(['job', 'job'])

    state = applyWaitEvent(state, {
      type: 'wait/change',
      version: 1,
      operation: 'resolve',
      id: 'w1',
      result: { index: 1, provider: 'job', value: { exit: 0 }, settledAt: 200 },
    })
    const settled = state?.waits[0]
    expect(settled?.status).toBe('ready')
    // The race records its winning leaf.
    expect(settled?.winnerIndex).toBe(1)
    expect(settled?.leaves[0]?.result).toBeUndefined()
    expect(settled?.leaves[1]?.result).toEqual({ exit: 0 })
  })

  it('turns all ready only when every unique leaf resolved', () => {
    const createAll = {
      type: 'wait/change',
      version: 1,
      operation: 'create',
      wait: {
        id: 'w2',
        createdAt: 5,
        expression: {
          mode: 'all',
          conditions: [
            { provider: 'job', input: { job_id: 'x' } },
            { provider: 'timer', input: { after_seconds: 30 } },
          ],
        },
      },
    } as const
    let state = applyWaitEvent(undefined, createAll)
    state = applyWaitEvent(state, {
      type: 'wait/change', version: 1, operation: 'resolve', id: 'w2',
      result: { index: 0, provider: 'job', value: null, settledAt: 10 },
    })
    expect(state?.waits[0]?.status).toBe('pending')
    // A duplicate resolve of the same leaf changes nothing observable.
    state = applyWaitEvent(state, {
      type: 'wait/change', version: 1, operation: 'resolve', id: 'w2',
      result: { index: 0, provider: 'job', value: null, settledAt: 11 },
    })
    expect(state?.waits[0]?.status).toBe('pending')
    state = applyWaitEvent(state, {
      type: 'wait/change', version: 1, operation: 'resolve', id: 'w2',
      result: { index: 1, provider: 'timer', value: 30, settledAt: 40 },
    })
    expect(state?.waits[0]?.status).toBe('ready')
    expect(state?.waits[0]?.winnerIndex).toBeUndefined()
  })

  it('cancels a pending wait but never a dispatched one', () => {
    let state = applyWaitEvent(undefined, createAny)
    state = applyWaitEvent(state, {
      type: 'wait/change', version: 1, operation: 'cancel', id: 'w1', cancelledAt: 150,
    })
    expect(state?.waits[0]?.status).toBe('cancelled')
    state = applyWaitEvent(state, {
      type: 'wait/change', version: 1, operation: 'cancel', id: 'w1', cancelledAt: 160,
    })
    expect(state?.waits[0]?.status).toBe('cancelled')

    let other = applyWaitEvent(undefined, createAny)
    other = applyWaitEvent(other, {
      type: 'wait/change', version: 1, operation: 'dispatch', ids: ['w1'], dispatchedAt: 300,
    })
    expect(other?.waits[0]?.status).toBe('dispatched')
    other = applyWaitEvent(other, {
      type: 'wait/change', version: 1, operation: 'cancel', id: 'w1', cancelledAt: 400,
    })
    expect(other?.waits[0]?.status).toBe('dispatched')
  })

  it('marks only the coalesced ids dispatched and keeps references otherwise', () => {
    let state = applyWaitEvent(undefined, createAny)
    const second = { ...createAny, wait: { ...createAny.wait, id: 'w9' } } as typeof createAny
    state = applyWaitEvent(state, second)
    const before = state?.waits[1]
    state = applyWaitEvent(state, {
      type: 'wait/change', version: 1, operation: 'dispatch', ids: ['w1'], dispatchedAt: 500,
    })
    expect(state?.waits[0]?.id).toBe('w1')
    expect(state?.waits[0]?.status).toBe('dispatched')
    expect(state?.waits[1]).toBe(before)
  })
})
