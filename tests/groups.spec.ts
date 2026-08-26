/** Durable group fold and existing-Wait compilation. */
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import { describe, expect, it, vi } from 'vitest'
import { applyGroupEvent, GoodJobGroupLogError, groupId, registerGroupTool } from '../src/groups.ts'
import type { GoodJobGroupView } from '../src/types.ts'

function group(overrides: Partial<GoodJobGroupView> = {}): GoodJobGroupView {
  return {
    id: groupId('group-1'),
    ownerSessionId: 'session-1',
    revision: 1,
    label: 'parallel checks',
    jobIds: ['bash-1', 'bash-2'],
    createdAt: 10,
    ...overrides,
  }
}

describe('GoodJob groups', () => {
  it('folds contiguous durable mutations and rejects stale revisions', () => {
    const created = applyGroupEvent(null, {
      type: 'goodjob/group-change', data: { version: 1, operation: 'create', group: group() },
    })
    const updated = applyGroupEvent(created, {
      type: 'goodjob/group-change', data: { version: 1, operation: 'update', group: group({ revision: 2, label: 'done' }) },
    })
    expect(updated).toEqual({ groups: [group({ revision: 2, label: 'done' })] })
    expect(() => applyGroupEvent(updated, {
      type: 'goodjob/group-change', data: { version: 1, operation: 'update', group: group({ revision: 4 }) },
    })).toThrow(GoodJobGroupLogError)
  })

  it('compiles group wait into the existing job Wait provider', async () => {
    const ctx = new Context()
    let tool: ToolDefinition | undefined
    const createWait = vi.fn(async () => ({ id: 'wait-1' }))
    const events: unknown[] = []
    const agent = {
      id: 'session-1',
      session: {
        header: { seedLength: 0 },
        events,
        append(type: string, data: unknown, options: unknown) {
          events.push({ type, data, ...options as object })
        },
      },
    } as unknown as Agent
    ctx.provide('tools', { register(value: ToolDefinition) { tool = value; return () => {} } })
    ctx.provide('jobs', { get: vi.fn(() => ({})) })
    ctx.provide('sessions', { flush: vi.fn(async () => true) })
    ctx.provide('waits', { create: createWait })
    registerGroupTool(ctx)
    expect(tool).toBeDefined()
    const exec = { agent } as Parameters<ToolDefinition['execute']>[1]
    const created = await tool!.execute({ action: 'create', label: 'fan out', job_ids: ['bash-1', 'bash-2'] }, exec)
    const id = (created as { group: { id: string } }).group.id
    await tool!.execute({ action: 'wait', group_id: id, mode: 'any' }, exec)
    expect(events[0]).toMatchObject({ type: 'goodjob/group-change', ignorable: true })
    expect(createWait).toHaveBeenCalledWith(agent, {
      mode: 'any',
      conditions: [
        { provider: 'job', input: { job_id: 'bash-1' } },
        { provider: 'job', input: { job_id: 'bash-2' } },
      ],
    })
  })
})
