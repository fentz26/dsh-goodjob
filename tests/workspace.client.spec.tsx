// @vitest-environment jsdom
/** Browser coverage for the native GoodJob operations workspace. */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { IApiClient, JobView } from '@deepseek-ai/dsh-client-connection/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULTS } from '../src/config-types.ts'
import { groupId } from '../src/groups.ts'
import { GoodJobWorkspace, type WorkspaceDomain } from '../src/client/WorkspaceView.tsx'
import type { GoodJobRpc } from '../src/client/TeamsList.tsx'

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  private readonly values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
  removeItem(key: string): void { this.values.delete(key) }
}

const build = {
  id: 'bash-1', kind: 'bash', label: 'build', status: 'running', startedAt: 1_000,
} as unknown as JobView
const tests = {
  id: 'bash-2', kind: 'bash', label: 'tests', status: 'completed', startedAt: 1_100, finishedAt: 1_400,
} as unknown as JobView

function domain(overrides: Partial<WorkspaceDomain> = {}): WorkspaceDomain {
  return {
    rootSessionId: 'lead-1',
    agents: [
      { id: 'agent-code', parentId: 'lead-1', depth: 1, label: 'code-agent', mode: 'continuable', activity: 'running', model: 'deepseek-chat', relatedJobIds: ['bash-1'] },
      { id: 'agent-review', parentId: 'lead-1', depth: 1, label: 'review-agent', mode: 'continuable', activity: 'inactive', relatedJobIds: ['bash-2'] },
    ],
    jobs: [{ sessionId: 'agent-code', job: build }, { sessionId: 'agent-review', job: tests }],
    groups: [{ id: groupId('group-build'), ownerSessionId: 'lead-1', revision: 1, label: 'Build Matrix', jobIds: ['bash-1', 'bash-2'], createdAt: 1_050 }],
    waits: [{ id: 'wait-9', sessionId: 'lead-1', createdAt: 1_200, mode: 'all', status: 'pending', leaves: [
      { index: 0, provider: 'job', input: { job_id: 'bash-1' } },
      { index: 1, provider: 'team-task', input: { task_id: 'review-task' } },
    ] }],
    teamAvailable: true,
    teamLive: true,
    teamMembers: [
      { id: 'lead-1', name: 'Lead', role: 'lead', status: 'idle', diagnostics: [] },
      { id: 'agent-review', name: 'review-agent', role: 'teammate', status: 'idle', diagnostics: [] },
    ],
    tasks: [{ id: 'review-task', revision: 2, subject: 'Review implementation', description: 'Review the implementation.', status: 'pending', blockedBy: ['implementation-task'], writeScopes: [], ownerName: 'review-agent', ready: false, writeScopeWarnings: [] }],
    messages: [],
    ...overrides,
  }
}

function harness(overrides: {
  domain?: WorkspaceDomain
  storage?: MemoryStorage
  observe?: ReturnType<typeof vi.fn>
  rpc?: ReturnType<typeof vi.fn>
} = {}) {
  const observe = overrides.observe ?? vi.fn(async ({ afterSequence }: { afterSequence: number }) => ({
    result: { ok: true as const, value: {
      chunks: afterSequence === 0 ? [{ sequence: 1, text: 'build output\n' }] : [{ sequence: 2, text: 'done\n' }],
      nextSequence: afterSequence === 0 ? 1 : 2,
      hasMore: afterSequence === 0,
      truncated: false,
      job: { ...build, status: 'completed', finishedAt: 2_000 },
    } },
  }))
  const prompt = vi.fn(async () => ({ result: { ok: true as const, value: {} } }))
  const interrupt = vi.fn(async () => ({ result: { ok: true as const, value: {} } }))
  const api = { jobs: { observe }, subagents: { prompt, interrupt } } as unknown as IApiClient
  const rpcCall = overrides.rpc ?? vi.fn(async () => ({ ok: true as const, value: { status: 'accepted' } }))
  const props = {
    domain: overrides.domain ?? domain(),
    api,
    rpc: { call: rpcCall } as GoodJobRpc,
    config: { ...DEFAULTS },
    storage: overrides.storage ?? new MemoryStorage(),
    onOpenSession: vi.fn(),
    onRefresh: vi.fn(),
  }
  return { props, observe, prompt, interrupt, rpcCall }
}

function explorer(): HTMLElement {
  return screen.getByRole('complementary', { name: 'GoodJob Explorer' })
}

afterEach(() => { cleanup() })

describe('GoodJobWorkspace', () => {
  it('opens Agent, Job, and Wait tabs, focuses existing identities, closes, and reopens', async () => {
    const { props } = harness()
    render(<GoodJobWorkspace {...props} />)
    fireEvent.click(within(explorer()).getByRole('button', { name: /code-agent/ }))
    fireEvent.click(within(explorer()).getByRole('button', { name: /build/ }))
    await screen.findByLabelText('Output for build')
    fireEvent.click(within(explorer()).getByRole('button', { name: /wait-9/ }))
    fireEvent.click(within(explorer()).getByRole('button', { name: /code-agent/ }))
    expect(screen.getAllByRole('tab').filter(tab => tab.textContent?.includes('code-agent'))).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Close code-agent' }))
    expect(screen.queryByRole('button', { name: 'Close code-agent' })).toBeNull()
    fireEvent.click(within(explorer()).getByRole('button', { name: /code-agent/ }))
    expect(screen.getByRole('button', { name: 'Close code-agent' })).toBeTruthy()
  })

  it('updates Explorer projections and hides optional Team sections when unavailable', () => {
    const fixture = harness()
    const view = render(<GoodJobWorkspace {...fixture.props} />)
    expect(within(explorer()).getByText('review-agent')).toBeTruthy()
    expect(within(explorer()).getByText('Review implementation')).toBeTruthy()
    view.rerender(<GoodJobWorkspace {...fixture.props} domain={domain({
      agents: fixture.props.domain.agents.filter(agent => agent.id !== 'agent-review'),
      teamAvailable: false,
      tasks: [],
    })} />)
    expect(within(explorer()).queryByText('review-agent')).toBeNull()
    expect(within(explorer()).queryByText('Review implementation')).toBeNull()
  })

  it('opens the same Job in two panes with independent observer cursors', async () => {
    const fixture = harness()
    render(<GoodJobWorkspace {...fixture.props} />)
    fireEvent.click(within(explorer()).getByRole('button', { name: /build/ }))
    await waitFor(() => { expect(fixture.observe).toHaveBeenCalledTimes(2) })
    fireEvent.click(screen.getByRole('button', { name: 'Split right' }))
    await waitFor(() => { expect(fixture.observe).toHaveBeenCalledTimes(4) })
    const cursors = fixture.observe.mock.calls.map(call => (call[0] as { afterSequence: number }).afterSequence)
    expect(cursors.filter(cursor => cursor === 0)).toHaveLength(2)
    expect(cursors.filter(cursor => cursor === 1)).toHaveLength(2)
    expect(screen.getAllByLabelText('Output for build')).toHaveLength(2)
  })

  it('splits down, keeps independent active entities, moves a tab, and closes a pane', async () => {
    const fixture = harness()
    render(<GoodJobWorkspace {...fixture.props} />)
    fireEvent.click(within(explorer()).getByRole('button', { name: /code-agent/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Split down' }))
    fireEvent.click(within(explorer()).getByRole('button', { name: /build/ }))
    await screen.findByLabelText('Output for build')
    const activeTabs = screen.getAllByRole('tab').filter(tab => tab.getAttribute('aria-selected') === 'true')
    expect(activeTabs.map(tab => tab.textContent)).toEqual(expect.arrayContaining([expect.stringContaining('code-agent'), expect.stringContaining('build')]))
    fireEvent.click(screen.getAllByRole('button', { name: 'Move active tab to other pane' })[1]!)
    expect(screen.getAllByRole('button', { name: 'Close build' })).toHaveLength(1)
    fireEvent.click(screen.getAllByRole('button', { name: 'Close pane' })[1]!)
    expect(screen.getAllByLabelText(/Workspace pane-/)).toHaveLength(1)
  })

  it('preserves Team quiet/wake delivery, mailbox updates, replies, and task reassignment', async () => {
    const fixture = harness()
    const view = render(<GoodJobWorkspace {...fixture.props} />)
    fireEvent.click(within(explorer()).getByRole('button', { name: /review-agent/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Message' }))
    fireEvent.change(screen.getByLabelText('Message review-agent'), { target: { value: 'Please report.' } })
    fireEvent.change(screen.getByLabelText('Delivery'), { target: { value: 'wakeup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => { expect(fixture.rpcCall).toHaveBeenCalledWith('/goodjob', 'team.message', expect.objectContaining({ target: 'review-agent', delivery: 'wakeup', text: 'Please report.' })) })

    view.rerender(<GoodJobWorkspace {...fixture.props} domain={domain({ messages: [{ id: 'message-1', senderId: 'agent-review', senderName: 'review-agent', targetId: 'lead-1', delivery: 'quiet', text: 'One regression found.', queuedAt: 1_500, delivered: true }] })} />)
    expect(screen.getByText('One regression found.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reply' }))
    fireEvent.change(screen.getByLabelText('Reply to review-agent'), { target: { value: 'Please fix it.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send reply' }))
    await waitFor(() => { expect(fixture.rpcCall).toHaveBeenCalledWith('/goodjob', 'team.message', expect.objectContaining({ target: 'review-agent', delivery: 'quiet', text: 'Please fix it.' })) })

    fireEvent.click(within(explorer()).getByRole('button', { name: /Review implementation/ }))
    fireEvent.change(screen.getByLabelText('Reassign Review implementation'), { target: { value: '' } })
    await waitFor(() => { expect(fixture.rpcCall).toHaveBeenCalledWith('/goodjob', 'team.reassign', expect.objectContaining({ taskId: 'review-task', expectedRevision: 2, owner: '' })) })
  })

  it('updates General counts, attention, activity, and graph navigation from domain projections', () => {
    const fixture = harness({ domain: domain({ jobs: [{ sessionId: 'agent-code', job: { ...build, status: 'failed', finishedAt: 2_000 } as JobView }, { sessionId: 'agent-review', job: tests }] }) })
    render(<GoodJobWorkspace {...fixture.props} />)
    expect(screen.getByText('0 running / 2 settled')).toBeTruthy()
    expect(screen.getAllByText('build failed').length).toBeGreaterThan(0)
    expect(screen.getByRole('list', { name: 'Activity feed' })).toBeTruthy()
    const graph = screen.getByRole('list', { name: 'Operations graph' })
    fireEvent.click(within(graph).getByRole('button', { name: 'Review implementation · blocked' }))
    expect(screen.getByRole('button', { name: 'Close Review implementation' })).toBeTruthy()
    fireEvent.click(within(explorer()).getByRole('button', { name: /review-agent/ }))
    fireEvent.click(within(explorer()).getByRole('button', { name: /review-agent/ }))
    expect(screen.getAllByRole('tab').filter(tab => tab.textContent?.includes('review-agent'))).toHaveLength(1)
  })

  it('restores presentation layout while resolving fresh domain state', async () => {
    const storage = new MemoryStorage()
    const first = harness({ storage })
    const mounted = render(<GoodJobWorkspace {...first.props} />)
    fireEvent.click(within(explorer()).getByRole('button', { name: /build/ }))
    await screen.findByLabelText('Output for build')
    fireEvent.click(screen.getByRole('button', { name: 'Split right' }))
    await waitFor(() => { expect(storage.getItem('goodjob.workspace.v1:lead-1')).not.toBeNull() })
    mounted.unmount()

    const failed = { ...build, status: 'failed', finishedAt: 2_000 } as JobView
    const second = harness({ storage, domain: domain({ jobs: [{ sessionId: 'agent-code', job: failed }] }) })
    render(<GoodJobWorkspace {...second.props} />)
    expect(screen.getAllByLabelText('Output for build')).toHaveLength(2)
    expect(screen.getAllByText('failed').length).toBeGreaterThan(0)
  })
})
