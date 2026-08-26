/** Loopback-only GoodJob operational commands over DSH Connection RPC. */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { SessionId } from '@deepseek-ai/dsh-session'
import { z } from 'zod'
import type {
  GoodJobDescendantView,
  GoodJobOperationsSnapshot,
  GoodJobRuntimeTeamMember,
  GoodJobRuntimeTeamTask,
} from './types.ts'

/** Logical Connection channel owned by GoodJob. */
export const GOODJOB_RPC_CHANNEL = '/goodjob'

interface RpcResult {
  ok: boolean
  value?: unknown
  error?: { code: 'bad-request' | 'internal'; message: string; details: Record<string, unknown> }
}

interface ConnectionFace {
  rpc: {
    handle(
      channel: string,
      handler: (endpoint: string, payload: unknown, signal: AbortSignal) => Promise<RpcResult>,
      options: { authority: 'loopback' },
    ): () => Promise<void>
  }
}

interface SubagentsFace {
  listDescendants(rootSessionId: string, signal?: AbortSignal): Promise<unknown[]>
}

interface TeamServiceFace {
  listMembers(agent: Agent): GoodJobRuntimeTeamMember[]
  listTasks(agent: Agent): GoodJobRuntimeTeamTask[]
  sendMessage(agent: Agent, request: {
    target: string
    content: { type: 'text'; text: string }[]
    delivery: 'quiet' | 'wakeup'
    signal: AbortSignal
  }): Promise<{ messageId: string; status: 'accepted' | 'queued' }>
  interrupt(agent: Agent, targetName: string): { previousStatus: 'running' | 'idle' | 'inactive' }
  updateTask(agent: Agent, request: {
    taskId: string
    expectedRevision: number
    action: 'reassign'
    owner: string
  }): Promise<GoodJobRuntimeTeamTask>
}

const sessionRequest = z.object({ sessionId: z.string().min(1) }).strict()
const messageRequest = z.object({
  sessionId: z.string().min(1),
  target: z.string().min(1),
  delivery: z.enum(['quiet', 'wakeup']),
  text: z.string().min(1).max(65_000),
}).strict()
const interruptRequest = z.object({
  sessionId: z.string().min(1),
  target: z.string().min(1),
}).strict()
const reassignRequest = z.object({
  sessionId: z.string().min(1),
  taskId: z.string().min(1),
  expectedRevision: z.number().int().positive(),
  owner: z.string(),
}).strict()

function ok(value: unknown): RpcResult {
  return { ok: true, value }
}

function badRequest(message: string): RpcResult {
  return { ok: false, error: { code: 'bad-request', message, details: { issues: [] } } }
}

function internal(message: string): RpcResult {
  return { ok: false, error: { code: 'internal', message, details: {} } }
}

function service<T>(ctx: Context, name: string): T | undefined {
  return ctx.get(name) as T | undefined
}

function lead(ctx: Context, sessionId: string): Agent | undefined {
  return service<{ get(id: string): Agent | undefined }>(ctx, 'agents')?.get(SessionId(sessionId))
}

function team(ctx: Context): TeamServiceFace | undefined {
  return service<TeamServiceFace>(ctx, 'agentTeams')
}

async function descendants(
  ctx: Context,
  sessionId: string,
  signal: AbortSignal,
): Promise<GoodJobDescendantView[]> {
  const subagents = service<SubagentsFace>(ctx, 'subagents')
  if (subagents === undefined) return []
  const rows = await subagents.listDescendants(SessionId(sessionId), signal)
  const agents = service<{ get(id: string): Agent | undefined }>(ctx, 'agents')
  const jobs = service<{ list(caller?: Agent): Array<{ id: string; ownerSession?: string }> }>(ctx, 'jobs')
  return rows.flatMap((row): GoodJobDescendantView[] => {
    if (typeof row !== 'object' || row === null) return []
    const value = row as Record<string, unknown>
    if (typeof value.id !== 'string' || typeof value.parentId !== 'string'
      || typeof value.depth !== 'number' || (value.kind !== 'child' && value.kind !== 'diagnostic')) return []
    const live = agents?.get(SessionId(value.id))
    const relatedJobIds = live === undefined || jobs === undefined
      ? []
      : jobs.list(live).filter(job => job.ownerSession === live.id).map(job => job.id)
    return [{
      id: value.id,
      parentId: value.parentId,
      depth: value.depth,
      kind: value.kind,
      ...(value.mode === 'one-shot' || value.mode === 'continuable' ? { mode: value.mode } : {}),
      ...typeof value.label === 'string' ? { label: value.label } : {},
      ...(value.activity === 'running' || value.activity === 'inactive' ? { activity: value.activity } : {}),
      ...typeof value.hasChildren === 'boolean' ? { hasChildren: value.hasChildren } : {},
      ...(value.reason === 'corrupt' || value.reason === 'unsupported' || value.reason === 'unavailable'
        ? { reason: value.reason }
        : {}),
      ...typeof live?.options.model === 'string' ? { model: live.options.model } : {},
      relatedJobIds,
    }]
  })
}

async function describe(ctx: Context, payload: unknown, signal: AbortSignal): Promise<RpcResult> {
  const parsed = sessionRequest.safeParse(payload)
  if (!parsed.success) return badRequest('operations.describe requires a non-empty sessionId')
  const members = team(ctx)
  const root = lead(ctx, parsed.data.sessionId)
  let runtimeMembers: GoodJobRuntimeTeamMember[] = []
  let tasks: GoodJobRuntimeTeamTask[] = []
  if (members !== undefined && root !== undefined) {
    try {
      runtimeMembers = members.listMembers(root)
      tasks = members.listTasks(root)
    } catch {
      // A root with no active Team state still has a valid empty operations view.
    }
  }
  const value: GoodJobOperationsSnapshot = {
    descendants: await descendants(ctx, parsed.data.sessionId, signal),
    team: {
      available: members !== undefined,
      live: members !== undefined && root !== undefined,
      members: runtimeMembers,
      tasks,
    },
  }
  return ok(value)
}

async function message(ctx: Context, payload: unknown, signal: AbortSignal): Promise<RpcResult> {
  const parsed = messageRequest.safeParse(payload)
  if (!parsed.success) return badRequest('team.message requires sessionId, target, delivery, and non-empty text')
  const teams = team(ctx)
  const root = lead(ctx, parsed.data.sessionId)
  if (teams === undefined) return internal('Agent Teams is not composed')
  if (root === undefined) return internal(`Team Lead session "${parsed.data.sessionId}" is not live`)
  const result = await teams.sendMessage(root, {
    target: parsed.data.target,
    delivery: parsed.data.delivery,
    signal,
    content: [{
      type: 'text',
      text: `Human via GoodJob, authorized as Team Lead:\n\n${parsed.data.text}`,
    }],
  })
  return ok(result)
}

async function interrupt(ctx: Context, payload: unknown): Promise<RpcResult> {
  const parsed = interruptRequest.safeParse(payload)
  if (!parsed.success) return badRequest('team.interrupt requires sessionId and target')
  const teams = team(ctx)
  const root = lead(ctx, parsed.data.sessionId)
  if (teams === undefined) return internal('Agent Teams is not composed')
  if (root === undefined) return internal(`Team Lead session "${parsed.data.sessionId}" is not live`)
  return ok(teams.interrupt(root, parsed.data.target))
}

async function reassign(ctx: Context, payload: unknown): Promise<RpcResult> {
  const parsed = reassignRequest.safeParse(payload)
  if (!parsed.success) return badRequest('team.reassign requires sessionId, taskId, expectedRevision, and owner')
  const teams = team(ctx)
  const root = lead(ctx, parsed.data.sessionId)
  if (teams === undefined) return internal('Agent Teams is not composed')
  if (root === undefined) return internal(`Team Lead session "${parsed.data.sessionId}" is not live`)
  return ok(await teams.updateTask(root, {
    taskId: parsed.data.taskId,
    expectedRevision: parsed.data.expectedRevision,
    action: 'reassign',
    owner: parsed.data.owner,
  }))
}

/** Register the loopback-only RPC endpoints used by GoodJob's browser half. */
export function registerGoodJobRpc(ctx: Context): () => Promise<void> {
  const connection = service<ConnectionFace>(ctx, 'connection')
  if (connection === undefined) throw new Error('GoodJob RPC requires the Host Connection service')
  return connection.rpc.handle(GOODJOB_RPC_CHANNEL, async (endpoint, payload, signal) => {
    try {
      switch (endpoint) {
        case 'operations.describe': return await describe(ctx, payload, signal)
        case 'team.message': return await message(ctx, payload, signal)
        case 'team.interrupt': return await interrupt(ctx, payload)
        case 'team.reassign': return await reassign(ctx, payload)
        default: return badRequest(`unknown GoodJob endpoint ${JSON.stringify(endpoint)}`)
      }
    } catch (error: unknown) {
      return internal(error instanceof Error ? error.message : String(error))
    }
  }, { authority: 'loopback' })
}
