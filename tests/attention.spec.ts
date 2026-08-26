import { describe, expect, it } from 'vitest'
import { deriveAttention } from '../src/client/attention.ts'

const clock = Date.parse('2030-06-01T12:00:00Z')

const goal = (phase: 'active' | 'paused' | 'blocked' | 'complete', message?: string) => ({
  id: 'g1',
  objective: 'Ship the fix',
  phase,
  blockedReason: message === undefined ? undefined : { code: 'needs-input', message },
})

describe('attention derivation', () => {
  it('derives exact items from authoritative states', () => {
    const items = deriveAttention({
      goal: goal('blocked', 'Waiting for schema answer'),
      jobsBySession: { lead: [{ id: 'j1', status: 'running' }, { id: 'j2', status: 'failed' }] },
      tasks: [],
      schedules: [],
      teamUnavailable: false,
      nowMs: clock,
    })
    expect(items).toEqual([
      {
        id: 'job-failed:lead:j2',
        severity: 'error',
        reason: 'failed',
        explanation: 'Job j2 failed.',
        target: { kind: 'job', sessionId: 'lead', jobId: 'j2' },
      },
      {
        id: 'goal-blocked',
        severity: 'warning',
        reason: 'blocked',
        explanation: 'Waiting for schema answer',
        target: { kind: 'goal' },
      },
    ])
  })

  it('never duplicates the same blocker', () => {
    const input = {
      goal: goal('blocked'),
      jobsBySession: { a: [{ id: 'j1', status: 'failed' }] } as const,
      tasks: [] as never[],
      schedules: [],
      teamUnavailable: false,
      nowMs: clock,
    }
    const first = deriveAttention(input)
    const second = deriveAttention(input)
    expect(first.map(item => item.id)).toEqual(second.map(item => item.id))
    expect(new Set(first.map(item => item.id)).size).toBe(first.length)
  })

  it('treats only open tasks with unfinished blockers as blocked', () => {
    const items = deriveAttention({
      goal: null,
      jobsBySession: {},
      tasks: [
        { id: 't1', subject: 'reviews', status: 'in_progress', blockedBy: ['t2'] },
        { id: 't2', subject: 'setup', status: 'completed', blockedBy: [] },
        { id: 't3', subject: 'docs', status: 'pending', blockedBy: [] },
      ],
      schedules: [],
      teamUnavailable: false,
      nowMs: clock,
    })
    expect(items).toEqual([])
  })

  it('marks overdue undispatched schedules deterministically', () => {
    const items = deriveAttention({
      goal: null,
      jobsBySession: {},
      tasks: [],
      schedules: [
        { id: 'past', kind: 'at', prompt: 'p', scheduledAt: '2030-05-01T00:00:00Z', dispatched: false },
        { id: 'future', kind: 'at', prompt: 'p', scheduledAt: '2031-05-01T00:00:00Z', dispatched: false },
        { id: 'done', kind: 'at', prompt: 'p', scheduledAt: '2030-01-01T00:00:00Z', dispatched: true },
        { id: 'after-kind', kind: 'after', prompt: 'p', delayedSeconds: 5, dispatched: false },
      ],
      teamUnavailable: false,
      nowMs: clock,
    })
    expect(items.map(item => item.id)).toEqual(['schedule-overdue:past'])
    expect(items[0]).toMatchObject({ severity: 'warning', reason: 'overdue', target: { kind: 'schedule', scheduleId: 'past' } })
  })

  it('errors sort ahead of warnings', () => {
    const items = deriveAttention({
      goal: goal('blocked'),
      jobsBySession: { s: [{ id: 'x', status: 'error' }] },
      tasks: [],
      schedules: [],
      teamUnavailable: true,
      nowMs: clock,
    })
    expect(items.map(item => item.severity)).toEqual(['error', 'warning'])
  })
})
