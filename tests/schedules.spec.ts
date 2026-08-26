import { describe, expect, it } from 'vitest'
import { applyScheduleEvent, deliveryState, isScheduleChange } from '../src/schedules.ts'
import type { GoodJobSchedulesProjection } from '../src/types.ts'

const at = '2030-01-01T00:00:00Z'

describe('schedule fold', () => {
  it('folds create, dispatch and delete across record kinds', () => {
    let state: GoodJobSchedulesProjection | null = null
    state = applyScheduleEvent(state, { type: 'schedule/change', version: 1, operation: 'create', schedule: { id: 's-at', kind: 'at', prompt: 'check build', scheduledAt: at } })
    expect((state?.schedules[0])).toMatchObject({ id: 's-at', kind: 'at', prompt: 'check build', dispatched: false })
    state = applyScheduleEvent(state, { type: 'schedule/change', version: 1, operation: 'create', schedule: { id: 's-every', kind: 'every', prompt: 'sync', scheduledAt: at, everySeconds: 600 } })
    state = applyScheduleEvent(state, { type: 'schedule/change', version: 1, operation: 'create', schedule: { id: 's-after', kind: 'after', prompt: 'retry', delayedSeconds: 30 } })
    state = applyScheduleEvent(state, { type: 'schedule/change', version: 1, operation: 'dispatch', id: 's-after' })
    expect(state?.schedules.find(item => item.id === 's-after')).toMatchObject({ dispatched: true })
    // An every-dispatch advances directly past missed occurrences: the
    // 00:10 occurrence is covered by the accepted decision, next = 00:20.
    const acceptedAt = '2030-01-01T00:11:00Z'
    state = applyScheduleEvent(state, { type: 'schedule/change', version: 1, operation: 'dispatch', id: 's-every', acceptedAt })
    expect(state?.schedules.find(item => item.id === 's-every')).toMatchObject({
      dispatched: false,
      scheduledAt: '2030-01-01T00:20:00Z',
    })
    state = applyScheduleEvent(state, { type: 'schedule/change', version: 1, operation: 'delete', id: 's-after' })
    expect(state?.schedules.some(item => item.id === 's-after')).toBe(false)
  })

  it('unknown versions/operations/payloads are inert with stable references', () => {
    let state: GoodJobSchedulesProjection | null = applyScheduleEvent(null, { type: 'schedule/change', version: 1, operation: 'create', schedule: { id: 'x', kind: 'at', prompt: 'p', scheduledAt: at } }) as GoodJobSchedulesProjection
    const before = state
    for (const noise of [
      { type: 'wait/change', version: 1 },
      { type: 'schedule/change', version: 2, operation: 'create', schedule: {} },
      { type: 'schedule/change', version: 1, operation: 'retire' },
      { type: 'schedule/change', version: 1, operation: 'create', schedule: { id: 'bad' } },
      { type: 'schedule/change', version: 1, operation: 'dispatch', id: 'missing' },
      undefined,
      'schedule',
    ]) {
      expect(applyScheduleEvent(state, noise)).toBe(before)
    }
    expect(isScheduleChange({ type: 'schedule/change', version: 1 })).toBe(true)
    expect(isScheduleChange({ type: 'schedule/change', version: 3 })).toBe(false)
  })

  it('delivery state derives from explicit targets and the caller clock only', () => {
    const base = { prompt: 'p', dispatched: false }
    const scheduled = { ...base, id: 'a', kind: 'at' as const, scheduledAt: '2030-01-01T00:00:00Z' }
    expect(deliveryState(scheduled, Date.parse('2029-12-31T23:59:59Z'))).toBe('scheduled')
    expect(deliveryState(scheduled, Date.parse('2030-01-01T00:00:00Z'))).toBe('overdue')
    expect(deliveryState({ ...scheduled, dispatched: true }, Date.parse('2031-01-01T00:00:00Z'))).toBe('unset')
    expect(deliveryState({ ...base, id: 'b', kind: 'after' as const, delayedSeconds: 5 }, 0)).toBe('unset')
  })

  it('duplicate creates for same id or identical rule are inert', () => {
    const create = { type: 'schedule/change', version: 1, operation: 'create', schedule: { id: 's1', kind: 'at' as const, prompt: 'p', scheduledAt: at } }
    let state = applyScheduleEvent(null, create) as GoodJobSchedulesProjection
    const once = state
    state = applyScheduleEvent(state, create) as GoodJobSchedulesProjection
    expect(state).toBe(once)
    const sameRuleDifferentId = applyScheduleEvent(state, { ...create, schedule: { ...create.schedule, id: 'other' } }) as GoodJobSchedulesProjection
    expect(sameRuleDifferentId.schedules.length).toBe(1)
  })
})
