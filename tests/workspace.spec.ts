/** Presentation-only workspace state keeps stable identities without domain snapshots. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  activateEntity,
  closeEntity,
  closePane,
  entityKey,
  initialWorkspaceState,
  moveEntity,
  openEntity,
  openToSide,
  restoreWorkspace,
} from '../src/client/workspace.ts'

describe('workspace state', () => {
  it('opens, focuses, closes, and reopens stable entity identities without duplicates', () => {
    const agent = { kind: 'agent', sessionId: 'agent-1' } as const
    const job = { kind: 'job', sessionId: 'agent-1', jobId: 'bash-1' } as const
    const wait = { kind: 'wait', waitId: 'wait-1' } as const
    let state = openEntity(initialWorkspaceState(), agent)
    state = openEntity(state, job)
    state = openEntity(state, wait)
    state = openEntity(state, agent)
    expect(state.panes[0]?.tabs.map(entityKey)).toEqual(['general', 'agent:agent-1', 'job:agent-1:bash-1', 'wait:wait-1'])
    expect(state.panes[0]?.activeKey).toBe('agent:agent-1')

    state = closeEntity(state, 'pane-1', 'agent:agent-1')
    expect(state.panes[0]?.tabs.map(entityKey)).not.toContain('agent:agent-1')
    state = openEntity(state, agent)
    expect(state.panes[0]?.activeKey).toBe('agent:agent-1')
  })

  it('opens and restores goal, workflow, and schedule entities by address only', () => {
    const goal = { kind: 'goal' } as const
    const workflow = { kind: 'workflow', workflowId: 'wf-1' } as const
    const schedule = { kind: 'schedule', scheduleId: 's-9' } as const
    let state = openEntity(initialWorkspaceState(), goal)
    state = openEntity(state, workflow)
    state = openEntity(state, schedule)
    expect(state.panes[0]?.tabs.map(entityKey)).toEqual(['general', 'goal', 'workflow:wf-1', 'schedule:s-9'])
    expect(entityKey(goal)).toBe('goal')
    // Round-trip through JSON keeps only the entity address.
    const restored = restoreWorkspace(JSON.stringify(state))
    expect(restored).toEqual(state)
    // Unknown entity kinds from newer builds are dropped, not guessed.
    const mixed = openEntity(initialWorkspaceState(), { kind: 'agent', sessionId: 'a1' })
    const stale = JSON.stringify({ ...state, panes: [{ id: 'pane-9', tabs: [...state.panes[0]!.tabs.filter(tab => entityKey(tab) !== 'schedule:s-9'), { kind: 'artifact' }], activeKey: 'goal' }] } as never)
    const recovered = restoreWorkspace(stale)
    expect(recovered?.panes[0]?.tabs.map(entityKey)).toEqual(['general', 'goal', 'workflow:wf-1'])
    void mixed
  })

  it('supports four panes, independent active tabs, moves, and pane closure', () => {
    let state = openEntity(initialWorkspaceState(), { kind: 'job', sessionId: 'lead', jobId: 'build' })
    state = openToSide(state, { kind: 'agent', sessionId: 'review' }, 'vertical')
    state = openToSide(state, { kind: 'wait', waitId: 'wait-1' }, 'horizontal')
    state = openToSide(state, { kind: 'task', taskId: 'review-task' }, 'vertical')
    expect(state.panes).toHaveLength(4)
    expect(state.focusedPaneId).toBe('pane-4')

    state = activateEntity(state, 'pane-1', 'general')
    expect(state.panes.find(pane => pane.id === 'pane-1')?.activeKey).toBe('general')
    state = moveEntity(state, 'pane-4', 'pane-2', 'task:review-task')
    expect(state.panes).toHaveLength(3)
    expect(state.panes.find(pane => pane.id === 'pane-2')?.activeKey).toBe('task:review-task')
    state = closePane(state, 'pane-3')
    expect(state.panes).toHaveLength(2)
  })

  it('restores valid presentation state and rejects embedded domain data', () => {
    const state = openToSide(initialWorkspaceState(), { kind: 'job', sessionId: 'lead', jobId: 'build' }, 'vertical')
    expect(restoreWorkspace(JSON.stringify(state))).toEqual(state)
    expect(restoreWorkspace('{"panes":[{"id":"pane-1","tabs":[{"kind":"job","status":"running"}],"activeKey":"job"}]}')).toBeUndefined()
    expect(restoreWorkspace('not json')).toBeUndefined()
  })

  it('keys and restores a generic registered Session view without snapshot data', () => {
    const trajectory = {
      kind: 'session-view', sessionId: 'code-agent', viewId: 'trajectory',
    } as const
    expect(entityKey(trajectory)).toBe('view:code-agent:trajectory')
    const state = openToSide(initialWorkspaceState(), trajectory, 'vertical')
    expect(restoreWorkspace(JSON.stringify(state))).toEqual(state)
    expect(restoreWorkspace(JSON.stringify({
      ...state,
      panes: [{
        id: 'pane-1',
        tabs: [{ kind: 'session-view', sessionId: 'code-agent', snapshot: {} }],
        activeKey: 'view:code-agent:trajectory',
      }],
    }))).toBeUndefined()
  })

  it('uses the registered view interface without importing Trajectory internals', () => {
    const sources = [
      readFileSync(new URL('../src/client/index.ts', import.meta.url), 'utf8'),
      readFileSync(new URL('../src/client/WorkspaceView.tsx', import.meta.url), 'utf8'),
    ].join('\n')
    expect(sources).not.toContain('@deepseek-ai/dsh-client-ui-trajectory')
    expect(sources).not.toMatch(/ui-trajectory\/src\//u)
  })
})
