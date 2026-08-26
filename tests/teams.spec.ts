/** Agent Teams durable projection behavior. */
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { WaitProvider } from '@deepseek-ai/dsh-wait'
import { describe, expect, it, vi } from 'vitest'
import { applyTeamEvent, registerTeamTaskWaitProvider } from '../src/teams.ts'

describe('GoodJob Team projection', () => {
  it('folds roster, task, and mailbox delivery from Team-owned events', () => {
    let state = applyTeamEvent(null, {
      type: 'team/member', data: { version: 1, teamId: 'lead-1', member: {
        id: 'agent-1', name: 'writer', description: 'writes', provider: 'subagent', context: 'fork', phase: 'active',
      } },
    })
    state = applyTeamEvent(state, {
      type: 'team/task', data: { version: 1, teamId: 'lead-1', task: {
        id: 'task-1', revision: 1, subject: 'Draft', description: 'Draft docs', status: 'in_progress',
        ownerId: 'agent-1', blockedBy: [], writeScopes: ['docs/'],
      } },
    })
    state = applyTeamEvent(state, {
      type: 'team/message/queued', time: 20, data: { version: 1, teamId: 'lead-1', message: {
        id: 'message-1', senderId: 'lead-1', senderName: 'lead', targetId: 'agent-1', delivery: 'quiet',
        content: [{ type: 'text', text: 'Status?' }],
      } },
    })
    state = applyTeamEvent(state, {
      type: 'team/message/delivered', data: { version: 1, teamId: 'lead-1', messageId: 'message-1' },
    })
    expect(state?.teams[0]).toMatchObject({
      teamId: 'lead-1',
      members: [{ name: 'writer', phase: 'active' }],
      tasks: [{ subject: 'Draft', status: 'in_progress' }],
      messages: [{ text: 'Status?', delivered: true }],
    })
  })

  it('does not invent state for absent or unknown Team events', () => {
    expect(applyTeamEvent(null, { type: 'turn/start', data: {} })).toBeNull()
    expect(applyTeamEvent(null, { type: 'team/future', data: { version: 2, teamId: 'lead-1' } })).toBeNull()
  })

  it('settles team-task waits from the durable current task snapshot', () => {
    const ctx = new Context()
    let provider: WaitProvider | undefined
    ctx.provide('waits', { registerProvider(value: WaitProvider) { provider = value; return () => {} } })
    registerTeamTaskWaitProvider(ctx)
    const settle = vi.fn()
    const agent = { id: 'lead-1', session: { events: [{
      type: 'team/task', data: { version: 1, teamId: 'lead-1', task: {
        id: 'task-1', revision: 3, subject: 'Draft', description: 'Draft docs', status: 'completed',
        blockedBy: [], writeScopes: [],
      } },
    }] } } as unknown as Agent
    const input = provider!.resolve({ task_id: 'task-1' }, Date.now())
    provider!.bind({ agent, input, settle, signal: new AbortController().signal })
    expect(settle).toHaveBeenCalledWith({ id: 'task-1', status: 'completed', revision: 3 })
  })
})
