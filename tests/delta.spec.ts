import { describe, expect, it } from 'vitest'
import { deriveOperationsDelta, type DeltaDomainLike } from '../src/client/delta.ts'

const now = Date.parse('2030-06-01T12:00:00Z')
const anchor = Date.parse('2030-06-01T11:00:00Z')

function domain(overrides: Partial<DeltaDomainLike> = {}): DeltaDomainLike {
  return {
    rootSessionId: 'root',
    jobs: [],
    waits: [],
    groups: [],
    goal: null,
    schedules: [],
    messages: [],
    ...overrides,
  }
}

describe('operations delta derivation', () => {
  it('first visit yields an explicit empty delta', () => {
    const delta = deriveOperationsDelta(domain(), { kind: 'first-visit' }, now)
    expect(delta.items).toEqual([])
    expect(delta.since).toEqual({ kind: 'first-visit' })
  })

  it('derives job starts and finishes with severity from status', () => {
    const delta = deriveOperationsDelta(domain({
      jobs: [
        { sessionId: 'lead', job: { id: 'j-new', label: 'build', status: 'running', startedAt: anchor + 60_000 } },
        { sessionId: 'lead', job: { id: 'j-ok', label: 'test', status: 'completed', startedAt: anchor - 5_000, finishedAt: anchor + 120_000 } },
        { sessionId: 'sub', job: { id: 'j-bad', label: 'lint', status: 'failed', startedAt: anchor - 5_000, finishedAt: anchor + 180_000 } },
        { sessionId: 'lead', job: { id: 'j-old', label: 'old', status: 'completed', startedAt: anchor - 10_000, finishedAt: anchor - 1_000 } },
      ],
    }), { kind: 'last-visit', at: anchor }, now)
    expect(delta.items.map(item => item.id)).toEqual([
      'job-finish:sub:j-bad',
      'job-finish:lead:j-ok',
      'job-start:lead:j-new',
    ])
    expect(delta.items[0]).toMatchObject({ severity: 'failure', entityKind: 'job', sessionId: 'sub' })
    expect(delta.items[1]).toMatchObject({ severity: 'info' })
  })

  it('derives waits, groups, and messages created since the anchor only', () => {
    const delta = deriveOperationsDelta(domain({
      waits: [
        { id: 'w-new', createdAt: anchor + 1, mode: 'all' },
        { id: 'w-old', createdAt: anchor - 1, mode: 'any' },
      ],
      groups: [{ id: 'g-1', label: 'batch', createdAt: anchor + 2 }],
      messages: [{ id: 'm-1', senderId: 'root', senderName: 'lead', targetId: 'sub', delivery: 'quiet', queuedAt: anchor + 3 }],
    }), { kind: 'last-visit', at: anchor }, now)
    expect(delta.items.map(item => item.id)).toEqual(['message:m-1', 'group-created:g-1', 'wait-created:w-new'])
  })

  it('derives goal phase changes with attention severity when blocked', () => {
    const blocked = deriveOperationsDelta(domain({
      goal: { phase: 'blocked', objective: 'ship', updatedAt: anchor + 5, blockedReason: { message: 'needs schema answer' } },
    }), { kind: 'last-visit', at: anchor }, now)
    expect(blocked.items).toEqual([{
      id: 'goal-updated',
      entityKind: 'goal',
      entityId: 'ship',
      sessionId: undefined,
      change: 'Goal blocked — needs schema answer',
      severity: 'attention',
      authoritativeAt: anchor + 5,
    }])
    const active = deriveOperationsDelta(domain({
      goal: { phase: 'active', objective: 'ship', updatedAt: anchor + 5 },
    }), { kind: 'last-visit', at: anchor }, now)
    expect(active.items[0]?.severity).toBe('info')
  })

  it('derives schedules that crossed their target inside the window as attention', () => {
    const delta = deriveOperationsDelta(domain({
      schedules: [
        { id: 's-crossed', kind: 'at', scheduledAt: '2030-06-01T11:30:00Z', dispatched: false },
        { id: 's-future', kind: 'at', scheduledAt: '2030-06-01T13:00:00Z', dispatched: false },
        { id: 's-dispatched', kind: 'at', scheduledAt: '2030-06-01T11:30:00Z', dispatched: true },
        { id: 's-relative', kind: 'after', dispatched: false },
      ],
    }), { kind: 'last-visit', at: anchor }, now)
    expect(delta.items.map(item => item.id)).toEqual(['schedule-overdue:s-crossed'])
    expect(delta.items[0]).toMatchObject({ severity: 'attention', authoritativeAt: Date.parse('2030-06-01T11:30:00Z') })
  })

  it('excludes events at or before the anchor exactly (boundary semantics)', () => {
    const delta = deriveOperationsDelta(domain({
      waits: [
        { id: 'w-edge-before', createdAt: anchor, mode: 'any' },
        { id: 'w-edge-after', createdAt: anchor + 1, mode: 'any' },
      ],
    }), { kind: 'last-visit', at: anchor }, now)
    expect(delta.items.map(item => item.id)).toEqual(['wait-created:w-edge-after'])
  })

  it('never invents timing: untimestamped facts stay absent', () => {
    // Workflow runs, wait settlement instants, and task transitions carry no
    // client-visible authoritative timestamps — they must not appear at all.
    const delta = deriveOperationsDelta(domain({
      waits: [{ id: 'w-settled', createdAt: anchor - 100, mode: 'all' }],
      goal: { phase: 'active', objective: 'x', updatedAt: anchor - 50 },
    }), { kind: 'last-visit', at: anchor }, now)
    expect(delta.items).toEqual([])
  })

  it('tolerates sparse domains from older fixtures', () => {
    const delta = deriveOperationsDelta({ rootSessionId: 'r' } as unknown as DeltaDomainLike, { kind: 'last-visit', at: anchor }, now)
    expect(delta.items).toEqual([])
  })
})
