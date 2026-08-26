/** Durable GoodJob Job Groups and their compact model-facing tool. */
import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { JobId } from '@deepseek-ai/dsh-jobs'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { JsonValue } from '@deepseek-ai/dsh-tools'
import type { GoodJobGroupChange, GoodJobGroupId, GoodJobGroupsProjection, GoodJobGroupView } from './types.ts'

/** Stable empty projection used before the first group mutation. */
export const NO_GROUPS: GoodJobGroupsProjection = { groups: [] }

/** Error raised when GoodJob's durable group history is inconsistent. */
export class GoodJobGroupLogError extends Error {
  constructor(message: string) {
    super(`corrupt GoodJob group log: ${message}`)
    this.name = 'GoodJobGroupLogError'
  }
}

/** Brand one validated group identity. */
export function groupId(value: string): GoodJobGroupId {
  return value as GoodJobGroupId
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new GoodJobGroupLogError(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new GoodJobGroupLogError(`${label} must be a non-empty string`)
  }
  return value
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new GoodJobGroupLogError(`${label} must be a non-negative safe integer`)
  }
  return value
}

function positiveInteger(value: unknown, label: string): number {
  const parsed = nonNegativeInteger(value, label)
  if (parsed === 0) throw new GoodJobGroupLogError(`${label} must be positive`)
  return parsed
}

function jobIds(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new GoodJobGroupLogError(`${label} must be a non-empty array`)
  }
  const ids = value.map((id, index) => text(id, `${label}[${index}]`))
  if (new Set(ids).size !== ids.length) throw new GoodJobGroupLogError(`${label} must be unique`)
  return ids
}

function parseGroup(value: unknown): GoodJobGroupView {
  const group = record(value, 'group')
  return {
    id: groupId(text(group.id, 'group.id')),
    ownerSessionId: text(group.ownerSessionId, 'group.ownerSessionId'),
    revision: positiveInteger(group.revision, 'group.revision'),
    label: text(group.label, 'group.label'),
    jobIds: jobIds(group.jobIds, 'group.jobIds'),
    createdAt: nonNegativeInteger(group.createdAt, 'group.createdAt'),
  }
}

/** Decode one current-version group mutation after its event type is known. */
function parseChange(value: unknown): GoodJobGroupChange {
  const change = record(value, 'change')
  if (change.version !== 1) throw new GoodJobGroupLogError(`unsupported version ${String(change.version)}`)
  if (change.operation === 'create' || change.operation === 'update') {
    return { version: 1, operation: change.operation, group: parseGroup(change.group) }
  }
  if (change.operation === 'delete') {
    return {
      version: 1,
      operation: 'delete',
      id: groupId(text(change.id, 'delete.id')),
      ownerSessionId: text(change.ownerSessionId, 'delete.ownerSessionId'),
      expectedRevision: positiveInteger(change.expectedRevision, 'delete.expectedRevision'),
      deletedAt: nonNegativeInteger(change.deletedAt, 'delete.deletedAt'),
    }
  }
  throw new GoodJobGroupLogError(`unsupported operation ${String(change.operation)}`)
}

/** Apply one current-version group mutation to a projection. */
export function applyGroupEvent(
  state: GoodJobGroupsProjection | null | undefined,
  event: unknown,
): GoodJobGroupsProjection | null | undefined {
  if (typeof event !== 'object' || event === null
    || (event as { type?: unknown }).type !== 'goodjob/group-change') return state
  const data = (event as { data?: unknown }).data
  if (typeof data !== 'object' || data === null || (data as { version?: unknown }).version !== 1) return state
  const change = parseChange(data)
  const groups = [...(state?.groups ?? NO_GROUPS.groups)]
  const index = groups.findIndex(group => group.id === (change.operation === 'delete' ? change.id : change.group.id))
  if (change.operation === 'create') {
    if (index !== -1) throw new GoodJobGroupLogError(`group ${change.group.id} was reused`)
    if (change.group.revision !== 1) throw new GoodJobGroupLogError(`group ${change.group.id} must begin at revision 1`)
    return { groups: [...groups, change.group] }
  }
  if (index === -1) {
    const id = change.operation === 'delete' ? change.id : change.group.id
    throw new GoodJobGroupLogError(`${change.operation} references unknown group ${id}`)
  }
  const current = groups[index] as GoodJobGroupView
  if (change.operation === 'update') {
    if (change.group.ownerSessionId !== current.ownerSessionId
      || change.group.createdAt !== current.createdAt
      || change.group.revision !== current.revision + 1) {
      throw new GoodJobGroupLogError(`group ${current.id} update changed identity or skipped a revision`)
    }
    groups[index] = change.group
    return { groups }
  }
  if (change.ownerSessionId !== current.ownerSessionId
    || change.expectedRevision !== current.revision) {
    throw new GoodJobGroupLogError(`group ${current.id} delete used stale identity or revision`)
  }
  groups.splice(index, 1)
  return { groups }
}

/** Replay current-version groups after the fork seed. */
export function foldGroups(events: readonly SessionEvent[], seedLength = 0): GoodJobGroupView[] {
  let state: GoodJobGroupsProjection | null | undefined = null
  for (const event of events.slice(seedLength)) {
    if (event.type === 'goodjob/group-change'
      && (event.data as { version?: unknown }).version !== 1) {
      throw new GoodJobGroupLogError(`unsupported version ${String((event.data as { version?: unknown }).version)}`)
    }
    state = applyGroupEvent(state, event)
  }
  return [...(state?.groups ?? [])]
}

/** Group operations supported by the single compact tool. */
type GroupAction = 'create' | 'add' | 'remove' | 'rename' | 'delete' | 'list' | 'wait'

interface GroupToolArgs {
  action: GroupAction
  group_id?: string
  label?: string
  job_ids?: string[]
  mode?: 'any' | 'all'
}

/** Result returned by the `job_group` tool. */
interface GroupToolResult {
  action: GroupAction
  groups: GoodJobGroupView[]
  group?: GoodJobGroupView
  waitId?: string
}

function requireAgent(agent: Agent | undefined): Agent {
  if (agent === undefined) throw new Error('job_group requires an Agent-owned tool call')
  return agent
}

function requiredArg(value: string | undefined, label: string): string {
  if (value === undefined || value.trim().length === 0) throw new Error(`${label} is required`)
  return value
}

function requestedJobIds(value: readonly string[] | undefined): string[] {
  if (value === undefined || value.length === 0) throw new Error('job_ids must contain at least one Job id')
  const ids = value.map((id, index) => requiredArg(id, `job_ids[${index}]`))
  if (new Set(ids).size !== ids.length) throw new Error('job_ids must be unique')
  return ids
}

function findGroup(agent: Agent, rawId: string | undefined): GoodJobGroupView {
  const id = groupId(requiredArg(rawId, 'group_id'))
  const group = foldGroups(agent.session.events, agent.session.header.seedLength ?? 0)
    .find(candidate => candidate.id === id)
  if (group === undefined) throw new Error(`GoodJob group ${id} not found in this Session`)
  return group
}

function assertJobs(ctx: Context, agent: Agent, ids: readonly string[]): void {
  const jobs = ctx.get('jobs') as { get(id: ReturnType<typeof JobId>, caller?: Agent): unknown } | undefined
  if (jobs === undefined) throw new Error('job_group requires @deepseek-ai/dsh-jobs')
  for (const id of ids) jobs.get(JobId(id), agent)
}

async function appendChange(ctx: Context, agent: Agent, change: GoodJobGroupChange): Promise<void> {
  agent.session.append('goodjob/group-change', change, { ignorable: true })
  const sessions = ctx.get('sessions') as { flush(session: Agent['session']): Promise<boolean> } | undefined
  if (sessions === undefined) throw new Error('job_group requires @deepseek-ai/dsh-session')
  await sessions.flush(agent.session)
}

function renderResult(result: GroupToolResult): string {
  if (result.waitId !== undefined) return `created ${result.waitId} over group ${result.group?.id ?? ''}`
  if (result.group !== undefined) {
    return `${result.group.id} r${result.group.revision} ${result.group.label}: ${result.group.jobIds.join(', ')}`
  }
  return result.groups.length === 0
    ? '(no GoodJob groups)'
    : result.groups.map(group => `${group.id} r${group.revision} ${group.label}: ${group.jobIds.join(', ')}`).join('\n')
}

function jsonResult(result: GroupToolResult): JsonValue {
  return result as unknown as JsonValue
}

/** Register GoodJob's single group-management and group-wait tool. */
export function registerGroupTool(ctx: Context): () => void {
  const tools = ctx.get('tools') as { register(definition: ReturnType<typeof defineTool>): () => void } | undefined
  if (tools === undefined) throw new Error('job_group requires @deepseek-ai/dsh-tools')
  return tools.register(defineTool({
    name: 'job_group',
    description: 'Create and edit durable logical groups of existing background Jobs, list them, or create one event-driven any/all wait over a group. Groups never start, stop, or own Jobs.',
    parameters: {
      action: { type: 'string', required: true, enum: ['create', 'add', 'remove', 'rename', 'delete', 'list', 'wait'] },
      group_id: { type: 'string', description: 'Group id returned by create/list; required except for create and list.' },
      label: { type: 'string', description: 'Non-empty group label for create or rename.' },
      job_ids: { type: 'array', items: { type: 'string' }, description: 'Existing Job ids for create, add, or remove.' },
      mode: { type: 'string', enum: ['any', 'all'], description: 'Existing wait expression mode for the wait action.' },
    },
    output: {
      schema: { type: 'json' },
      render: (_args, value) => [{ type: 'text', text: renderResult(value as unknown as GroupToolResult) }],
    },
    async execute(args: GroupToolArgs, exec): Promise<JsonValue> {
      const agent = requireAgent(exec.agent)
      if (args.action === 'list') {
        return jsonResult({ action: args.action, groups: foldGroups(agent.session.events, agent.session.header.seedLength ?? 0) })
      }
      if (args.action === 'create') {
        const ids = requestedJobIds(args.job_ids)
        assertJobs(ctx, agent, ids)
        const group: GoodJobGroupView = {
          id: groupId(`group-${randomUUID()}`),
          ownerSessionId: agent.id,
          revision: 1,
          label: requiredArg(args.label, 'label'),
          jobIds: ids,
          createdAt: Date.now(),
        }
        await appendChange(ctx, agent, { version: 1, operation: 'create', group })
        return jsonResult({ action: args.action, group, groups: [group] })
      }
      const current = findGroup(agent, args.group_id)
      if (args.action === 'wait') {
        const waits = ctx.get('waits')
        if (waits === undefined) throw new Error('job_group wait requires @deepseek-ai/dsh-wait')
        const mode = args.mode ?? 'all'
        const wait = await waits.create(agent, {
          mode,
          conditions: current.jobIds.map(id => ({ provider: 'job', input: { job_id: id } })),
        })
        return jsonResult({ action: args.action, group: current, groups: [current], waitId: wait.id })
      }
      if (args.action === 'delete') {
        await appendChange(ctx, agent, {
          version: 1,
          operation: 'delete',
          id: current.id,
          ownerSessionId: current.ownerSessionId,
          expectedRevision: current.revision,
          deletedAt: Date.now(),
        })
        return jsonResult({ action: args.action, groups: [] })
      }
      let next: GoodJobGroupView
      if (args.action === 'rename') {
        next = { ...current, revision: current.revision + 1, label: requiredArg(args.label, 'label') }
      } else {
        const ids = requestedJobIds(args.job_ids)
        if (args.action === 'add') {
          assertJobs(ctx, agent, ids)
          const additions = ids.filter(id => !current.jobIds.includes(id))
          if (additions.length === 0) return jsonResult({ action: args.action, group: current, groups: [current] })
          next = { ...current, revision: current.revision + 1, jobIds: [...current.jobIds, ...additions] }
        } else {
          const retained = current.jobIds.filter(id => !ids.includes(id))
          if (retained.length === current.jobIds.length) return jsonResult({ action: args.action, group: current, groups: [current] })
          if (retained.length === 0) throw new Error('a GoodJob group must retain at least one Job')
          next = { ...current, revision: current.revision + 1, jobIds: retained }
        }
      }
      await appendChange(ctx, agent, { version: 1, operation: 'update', group: next })
      return jsonResult({ action: args.action, group: next, groups: [next] })
    },
    presentCall: args => ({
      card: 'generic',
      title: `GoodJob group: ${args.action}`,
      kind: args.action === 'list' ? 'read' : 'execute',
      ...args.group_id === undefined ? {} : { rawInput: args.group_id },
    }),
  }))
}
