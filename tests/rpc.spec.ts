/** Loopback RPC authorization and provenance behavior. */
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { describe, expect, it, vi } from 'vitest'
import { registerGoodJobRpc } from '../src/rpc.ts'

describe('GoodJob RPC', () => {
  it('routes human Team messages through the live Lead with explicit provenance', async () => {
    const ctx = new Context()
    let handler: ((endpoint: string, payload: unknown, signal: AbortSignal) => Promise<unknown>) | undefined
    const lead = { id: 'lead-1' } as Agent
    const sendMessage = vi.fn(async () => ({ messageId: 'message-1', status: 'accepted' as const }))
    ctx.provide('connection', { rpc: { handle(
      _channel: string,
      value: typeof handler,
      _options: unknown,
    ) { handler = value; return async () => {} } } })
    ctx.provide('agents', { get: vi.fn(() => lead) })
    ctx.provide('agentTeams', {
      listMembers: vi.fn(() => []),
      listTasks: vi.fn(() => []),
      sendMessage,
      interrupt: vi.fn(),
      updateTask: vi.fn(),
    })
    registerGoodJobRpc(ctx)
    await handler!('team.message', {
      sessionId: 'lead-1', target: 'writer', delivery: 'quiet', text: 'Please report.',
    }, new AbortController().signal)
    expect(sendMessage).toHaveBeenCalledWith(lead, expect.objectContaining({
      target: 'writer',
      delivery: 'quiet',
      content: [{ type: 'text', text: 'Human via GoodJob, authorized as Team Lead:\n\nPlease report.' }],
    }))
  })
})
