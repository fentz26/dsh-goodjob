/** Read-only Agent Teams projection and the Team-task wait adapter. */
import type { Context } from '@deepseek-ai/cordis'
import { applyGroupEvent, registerGroupTool } from './groups.ts'
import type {
  GoodJobTeamMemberView,
  GoodJobTeamMessageView,
  GoodJobTeamsProjection,
  GoodJobTeamTaskView,
  GoodJobTeamView,
  GoodJobWaitProvider,
  GoodJobWaitRegistry,
} from './types.ts'

/** Stable empty Team projection. */
export const NO_TEAMS: GoodJobTeamsProjection = { teams: [] }

function rawRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function rawString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function textContent(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.flatMap((block) => {
    const record = rawRecord(block)
    return record?.type === 'text' && typeof record.text === 'string' ? [record.text] : []
  }).join('\n')
}

function teamAt(state: GoodJobTeamsProjection | null | undefined, teamId: string): GoodJobTeamView {
  return state?.teams.find(team => team.teamId === teamId) ?? {
    teamId,
    members: [],
    tasks: [],
    messages: [],
  }
}

function replaceTeam(
  state: GoodJobTeamsProjection | null | undefined,
  team: GoodJobTeamView,
): GoodJobTeamsProjection {
  const teams = [...(state?.teams ?? NO_TEAMS.teams)]
  const index = teams.findIndex(candidate => candidate.teamId === team.teamId)
  if (index === -1) teams.push(team)
  else teams[index] = team
  return { teams }
}

function memberView(value: unknown): GoodJobTeamMemberView | undefined {
  const member = rawRecord(value)
  const id = rawString(member?.id)
  const name = rawString(member?.name)
  const description = rawString(member?.description)
  const provider = rawString(member?.provider)
  if (id === undefined || name === undefined || description === undefined || provider === undefined
    || (member?.context !== 'fresh' && member?.context !== 'fork')
    || (member?.phase !== 'provisioning' && member?.phase !== 'active' && member?.phase !== 'failed')) return undefined
  return {
    id,
    name,
    description,
    provider,
    context: member.context,
    phase: member.phase,
    ...typeof member.error === 'string' ? { error: member.error } : {},
  }
}

function taskView(value: unknown): GoodJobTeamTaskView | undefined {
  const task = rawRecord(value)
  const id = rawString(task?.id)
  const subject = rawString(task?.subject)
  if (id === undefined || subject === undefined || typeof task?.description !== 'string'
    || typeof task.revision !== 'number' || !Number.isSafeInteger(task.revision) || task.revision < 1
    || (task.status !== 'pending' && task.status !== 'in_progress'
      && task.status !== 'completed' && task.status !== 'deleted')
    || !Array.isArray(task.blockedBy) || !task.blockedBy.every(item => typeof item === 'string')
    || !Array.isArray(task.writeScopes) || !task.writeScopes.every(item => typeof item === 'string')) return undefined
  return {
    id,
    revision: task.revision,
    subject,
    description: task.description,
    status: task.status,
    ...typeof task.ownerId === 'string' ? { ownerId: task.ownerId } : {},
    blockedBy: task.blockedBy,
    writeScopes: task.writeScopes,
  }
}

/** Apply one Team-owned Session event without importing the experimental package. */
export function applyTeamEvent(
  state: GoodJobTeamsProjection | null | undefined,
  event: unknown,
): GoodJobTeamsProjection | null | undefined {
  const envelope = rawRecord(event)
  if (envelope === undefined || typeof envelope.type !== 'string' || !envelope.type.startsWith('team/')) return state
  const data = rawRecord(envelope.data)
  const teamId = rawString(data?.teamId)
  if (data?.version !== 1 || teamId === undefined) return state
  const team = teamAt(state, teamId)
  if (envelope.type === 'team/member') {
    const member = memberView(data.member)
    if (member === undefined) return state
    return replaceTeam(state, {
      ...team,
      members: [...team.members.filter(current => current.id !== member.id), member],
    })
  }
  if (envelope.type === 'team/task') {
    const task = taskView(data.task)
    if (task === undefined) return state
    return replaceTeam(state, {
      ...team,
      tasks: [...team.tasks.filter(current => current.id !== task.id), task],
    })
  }
  if (envelope.type === 'team/message/queued') {
    const message = rawRecord(data.message)
    const id = rawString(message?.id)
    const senderId = rawString(message?.senderId)
    const senderName = rawString(message?.senderName)
    const targetId = rawString(message?.targetId)
    if (id === undefined || senderId === undefined || senderName === undefined || targetId === undefined
      || (message?.delivery !== 'quiet' && message?.delivery !== 'wakeup')) return state
    const view: GoodJobTeamMessageView = {
      id,
      senderId,
      senderName,
      targetId,
      delivery: message.delivery,
      text: textContent(message.content),
      queuedAt: typeof envelope.time === 'number' ? envelope.time : 0,
      delivered: false,
    }
    return replaceTeam(state, {
      ...team,
      messages: [...team.messages.filter(current => current.id !== id), view],
    })
  }
  if (envelope.type === 'team/message/delivered') {
    const messageId = rawString(data.messageId)
    if (messageId === undefined) return state
    let changed = false
    const messages = team.messages.map((message) => {
      if (message.id !== messageId || message.delivered) return message
      changed = true
      return { ...message, delivered: true }
    })
    return changed ? replaceTeam(state, { ...team, messages }) : state
  }
  return state
}

function completedTask(events: readonly unknown[], teamId: string, taskId: string): GoodJobTeamTaskView | undefined {
  let latest: GoodJobTeamTaskView | undefined
  for (const event of events) {
    const envelope = rawRecord(event)
    if (envelope?.type !== 'team/task') continue
    const data = rawRecord(envelope.data)
    if (data?.version !== 1 || data.teamId !== teamId) continue
    const task = taskView(data.task)
    if (task?.id === taskId) latest = task
  }
  return latest?.status === 'completed' ? latest : undefined
}

/** Register current-state Team task completion over durable Team snapshots. */
export function registerTeamTaskWaitProvider(ctx: Context): () => void {
  const provider: GoodJobWaitProvider = {
    name: 'team-task',
    description: 'Agent Team task completion; input {"task_id":"<id>"}',
    resolve(input) {
      const candidate = rawRecord(input)
      const taskId = rawString(candidate?.task_id)
      if (taskId === undefined) throw new Error('team-task wait input requires a non-empty task_id')
      return { task_id: taskId }
    },
    bind({ agent, input, settle }) {
      const taskId = (input as { task_id: string }).task_id
      const check = (): void => {
        const task = completedTask(agent.session.events, agent.id, taskId)
        if (task !== undefined) {
          settle({ id: task.id, status: task.status, revision: task.revision })
        }
      }
      const dispose = ctx.on('session/event', (session, event) => {
        if (session === agent.session && (event as { type?: unknown }).type === 'team/task') check()
      })
      check()
      return dispose
    },
  }
  const waits = ctx.get('waits') as GoodJobWaitRegistry | undefined
  if (waits === undefined) throw new Error('team-task waits require @deepseek-ai/dsh-wait')
  return waits.registerProvider(provider)
}
