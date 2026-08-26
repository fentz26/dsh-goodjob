import { describe, expect, it } from 'vitest'
import {
  applyWorkflowEvent,
  isAgentEnd,
  isAgentStart,
  isRunEnd,
  isRunStart,
  NO_WORKFLOWS,
} from '../src/workflows.ts'
import type { GoodJobWorkflowsProjection } from '../src/types.ts'

const run = (id: string) => ({ type: 'tool-workflow/run-start', runId: id, name: `Run ${id}` })
const start = (runId: string, seq: number, childId = `child-${seq}`, phase?: string) =>
  ({ type: 'tool-workflow/agent-start', runId, seq, label: `member ${seq}`, phase, childId })
const end = (runId: string, seq: number, outcome: 'completed' | 'failed' | 'cancelled' = 'completed') =>
  ({ type: 'tool-workflow/agent-end', runId, seq, outcome })
const stop = (runId: string, stopReason: 'completed' | 'cancelled' | 'error' = 'completed') =>
  ({ type: 'tool-workflow/run-end', runId, stopReason })

describe('workflow fold', () => {
  it('replays a full log deterministically', () => {
    let state: GoodJobWorkflowsProjection | null = null
    for (const event of [run('w1'), start('w1', 1, 'child-1', 'research'), start('w1', 2), end('w1', 1), end('w1', 2, 'failed'), stop('w1')]) {
      state = applyWorkflowEvent(state, event)
    }
    expect(state).toEqual({
      runs: [{
        id: 'w1',
        name: 'Run w1',
        state: 'completed',
        stopReason: 'completed',
        members: [
          { seq: 1, label: 'member 1', phase: 'research', childId: 'child-1', outcome: 'completed' },
          { seq: 2, label: 'member 2', phase: undefined, childId: 'child-2', outcome: 'failed' },
        ],
      }],
    })
  })

  it('incremental application matches full replay (differential)', () => {
    const log = [run('a'), run('b'), start('b', 1), start('a', 1), end('b', 1, 'cancelled'), stop('a', 'error'), stop('b')]
    const incremental = log.reduce<GoodJobWorkflowsProjection | null>((state, event) => applyWorkflowEvent(state, event), null)
    const full = log.reduce<GoodJobWorkflowsProjection | null>((state, event) => applyWorkflowEvent(state, event), NO_WORKFLOWS)
    expect(incremental).toEqual(full)
  })

  it('treats unrelated and malformed events as no-ops preserving identity', () => {
    let state: GoodJobWorkflowsProjection | null = null
    state = applyWorkflowEvent(state, run('keep'))
    const before = state
    for (const noise of [
      { type: 'goal/change', version: 1 },
      { type: 'tool-workflow/run-start', name: 'missing id' },
      { type: 'tool-workflow/agent-start', runId: 'x' },
      { type: 'tool-workflow/agent-end', runId: 'x', seq: 1 },
      { type: 'tool-workflow/run-end', runId: 'x', stopReason: 'boom' },
      null,
      42,
      {},
    ]) {
      state = applyWorkflowEvent(state, noise)
      expect(state).toBe(before)
    }
    // A duplicate start for an existing run is inert too.
    state = applyWorkflowEvent(state, run('keep'))
    expect(state).toBe(before)
  })

  it('ignores a terminal stop when the run already ended', () => {
    let state: GoodJobWorkflowsProjection | null = applyWorkflowEvent(null, run('w'))
    state = applyWorkflowEvent(state, stop('w', 'completed'))
    const settled = state
    state = applyWorkflowEvent(state, stop('w', 'error'))
    expect(state).toBe(settled)
  })

  it('member outcomes settle exactly the matching sequence', () => {
    let state = applyWorkflowEvent(null, run('w')) as GoodJobWorkflowsProjection
    state = applyWorkflowEvent(state, start('w', 3)) as GoodJobWorkflowsProjection
    state = applyWorkflowEvent(state, end('w', 9)) as GoodJobWorkflowsProjection
    expect((state?.runs[0]?.members[0]).outcome).toBeUndefined()
    state = applyWorkflowEvent(state, end('w', 3, 'failed')) as GoodJobWorkflowsProjection
    expect((state?.runs[0]?.members[0])).toMatchObject({ seq: 3, outcome: 'failed' })
  })

  it('guards reject structurally wrong payloads', () => {
    expect(isRunStart({ type: 'tool-workflow/run-start', runId: 7, name: 'x' })).toBe(false)
    expect(isAgentStart({ type: 'tool-workflow/agent-start', runId: 'r', seq: 1.5, label: 'l', childId: 'c' })).toBe(false)
    expect(isAgentEnd({ type: 'tool-workflow/agent-end', runId: 'r', seq: 1, outcome: 'boom' })).toBe(false)
    expect(isRunEnd({ type: 'tool-workflow/run-end', runId: 'r', stopReason: undefined })).toBe(false)
  })
})
