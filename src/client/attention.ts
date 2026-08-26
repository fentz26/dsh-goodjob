/**
 * Deterministic attention and blocking derivation.
 *
 * Every item is computed from authoritative projection state that GoodJob
 * already mirrors: goal phase from the upstream `goal` projection, Job
 * statuses from the sessions mirror, schedule delivery state from the durable
 * record plus an explicit clock, and Team task dependencies plus member
 * phases from the Team fold. Nothing here invents state — when a relation or
 * fact is unknown it is omitted rather than estimated.
 *
 * The same blocker never appears twice unless distinct authoritative reasons
 * genuinely exist.
 * @module dsh-goodjob/client/attention
 */
import type { GoodJobScheduleRecordView } from '../types.ts'

/** Where one attention item's navigation should land. */
export type AttentionTarget =
  | { kind: 'job'; sessionId: string; jobId: string }
  | { kind: 'goal' }
  | { kind: 'wait'; waitId: string }
  | { kind: 'task'; taskId: string }
  | { kind: 'schedule'; scheduleId: string }

/** One human-attention surface entry. */
export interface AttentionItem {
  /** Stable identity: deduplicates a blocker across sections. */
  id: string
  severity: 'info' | 'warning' | 'error'
  /** Objective category rendered as a chip. */
  reason:
    | 'blocked'
    | 'failed'
    | 'input-required'
    | 'approval-required'
    | 'overdue'
    | 'unavailable'
  explanation: string
  target: AttentionTarget
}

/** Minimal structural faces consumed by the derivation (test-friendly). */
export interface AttentionGoalLike {
  id?: string
  objective?: string
  phase?: 'active' | 'paused' | 'blocked' | 'complete'
  blockedReason?: { code: string; message: string }
}

export interface AttentionTaskLike {
  id: string
  subject: string
  status: 'pending' | 'in_progress' | 'completed' | 'deleted'
  ownerId?: string
  blockedBy: readonly string[]
}

/** Inputs to {@link deriveAttention}. Only known facts are passed in. */
export interface AttentionInput {
  goal?: AttentionGoalLike | null
  jobsBySession: Readonly<Record<string, readonly { id: string; status: string; label?: string }[] | undefined>>
  tasks: readonly AttentionTaskLike[]
  schedules: readonly GoodJobScheduleRecordView[]
  teamUnavailable: boolean
  /** Current clock for overdue derivation (epoch ms). */
  nowMs: number
}

/**
 * Derive every current attention item.
 * @param input - authoritative projection slices.
 * @returns items ordered error → warning → info, then by identity.
 */
export function deriveAttention(input: AttentionInput): readonly AttentionItem[] {
  const items: AttentionItem[] = []
  const tasks = input.tasks ?? []
  const schedules = input.schedules ?? []
  const jobsBySession = input.jobsBySession ?? {}
  if (input.goal?.phase === 'blocked') {
    const message = input.goal.blockedReason?.message
    items.push({
      id: 'goal-blocked',
      severity: 'warning',
      reason: 'blocked',
      explanation: message === undefined ? 'Goal is blocked.' : message,
      target: { kind: 'goal' },
    })
  }

  for (const [sessionId, jobs] of Object.entries(jobsBySession)) {
    for (const job of jobs ?? []) {
      if (job.status !== 'failed' && job.status !== 'error') continue
      items.push({
        id: `job-failed:${sessionId}:${String(job.id)}`,
        severity: 'error',
        reason: 'failed',
        explanation: `Job ${job.label ?? String(job.id)} failed.`,
        target: { kind: 'job', sessionId, jobId: String(job.id) },
      })
    }
  }

  if (!input.teamUnavailable) {
    for (const task of tasks) {
      // Deleted/completed tasks cannot block; only open tasks with
      // authoritative unresolved blockers surface.
      if (task.status !== 'pending' && task.status !== 'in_progress') continue
      const openBlockers = task.blockedBy.filter(id =>
        !tasks.some(other => other.id === id && (other.status === 'completed' || other.status === 'deleted')))
      if (openBlockers.length === 0) continue
      items.push({
        id: `task-blocked:${task.id}`,
        severity: 'warning',
        reason: 'blocked',
        explanation: `Task ${task.subject} blocked by ${openBlockers.length} unfinished ${openBlockers.length === 1 ? 'dependency' : 'dependencies'}.`,
        target: { kind: 'task', taskId: task.id },
      })
    }
  }

  for (const item of schedulesOverdue(schedules, input.nowMs)) {
    items.push({
      id: `schedule-overdue:${item.id}`,
      severity: 'warning',
      reason: 'overdue',
      explanation: `Reminder ${item.id} passed its target time and has not been dispatched.`,
      target: { kind: 'schedule', scheduleId: item.id },
    })
  }

  const order = { error: 0, warning: 1, info: 2 } as const
  return [...items].sort((a, b) => order[a.severity] - order[b.severity] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

function schedulesOverdue(
  schedules: readonly GoodJobScheduleRecordView[],
  nowMs: number,
): readonly GoodJobScheduleRecordView[] {
  return schedules.filter(item => {
    if (item.kind === 'after' || item.dispatched || item.scheduledAt === undefined) return false
    return Date.parse(item.scheduledAt) <= nowMs
  })
}
