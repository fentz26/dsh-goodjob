/**
 * Deterministic operations delta ("What changed?").
 *
 * Derives the compact set of authoritative changes since a presentation-local
 * reference anchor. NO new durable authority is created: every item comes from
 * state GoodJob already projects, and only fields upstream actually timestamps
 * participate. Facts without authoritative timing (workflow runs, wait
 * settlement instants, Team task transitions) are excluded rather than
 * guessed — see docs/features/delta.md.
 *
 * Reference semantics: no universal cross-projection cursor exists on the
 * client today, so the anchor is a wall-clock instant captured by the
 * workspace ("last visit") and compared ONLY against timestamps that the
 * owning capabilities recorded authoritatively. Ordering inside one source
 * uses its own timestamps; the merged list sorts by authoritative time and
 * falls back to stable identity ordering.
 * @module dsh-goodjob/client/delta
 */
import type { WorkspaceDomain } from './WorkspaceView.tsx'

/** What the delta is relative to. */
export type DeltaAnchor =
  | { kind: 'first-visit' }
  | { kind: 'last-visit'; at: number }

/** One derived operational change. */
export interface DeltaItem {
  /** Stable identity: deduplicates one underlying change. */
  id: string
  /** Presentation category for filtering. */
  entityKind: 'job' | 'wait' | 'job-group' | 'goal' | 'schedule' | 'message'
  entityId: string
  sessionId?: string
  /** Factual change phrase — never a heuristic. */
  change: string
  severity: 'info' | 'attention' | 'failure'
  /** Authoritative event timestamp when the owning capability recorded one. */
  authoritativeAt?: number
}

/** Structural input face (test-friendly; the workspace domain satisfies it). */
export interface DeltaDomainLike {
  rootSessionId: string
  jobs: readonly { sessionId: string; job: { id: string | number; label: string; status: string; startedAt: number; finishedAt?: number } }[]
  waits: readonly { id: string; createdAt: number; mode: string }[]
  groups: readonly { id: string | number; label: string; createdAt: number }[]
  goal: { phase?: string; objective?: string; updatedAt?: number; blockedReason?: { message: string } } | null
  schedules: readonly { id: string; kind: 'after' | 'at' | 'every'; scheduledAt?: string; dispatched: boolean }[]
  messages: readonly { id: string; senderId: string; senderName: string; targetId: string; delivery: string; queuedAt: number }[]
}

export interface OperationsDelta {
  since: DeltaAnchor
  generatedAt: number
  items: readonly DeltaItem[]
}

const FAILURE_JOB_STATUSES = new Set(['failed', 'error'])

/**
 * Derive every deterministic change since the anchor.
 * @param domain - projected slices carrying authoritative timestamps.
 * @param anchor - reference instant (`first-visit` yields an empty delta).
 * @param nowMs - current clock for boundary comparisons only.
 */
export function deriveOperationsDelta(
  domain: DeltaDomainLike,
  anchor: DeltaAnchor,
  nowMs: number,
): OperationsDelta {
  const items: DeltaItem[] = []
  if (anchor.kind === 'first-visit') return { since: anchor, generatedAt: nowMs, items }

  const since = anchor.at
  const after = (at: number | undefined): at is number => at !== undefined && at > since && at <= nowMs

  for (const { sessionId, job } of domain.jobs ?? []) {
    const id = String(job.id)
    if (after(job.startedAt)) {
      items.push({
        id: `job-start:${sessionId}:${id}`,
        entityKind: 'job',
        entityId: id,
        sessionId,
        change: `${job.label} started`,
        severity: 'info',
        authoritativeAt: job.startedAt,
      })
    }
    if (after(job.finishedAt)) {
      items.push({
        id: `job-finish:${sessionId}:${id}`,
        entityKind: 'job',
        entityId: id,
        sessionId,
        change: `${job.label} ${job.status}`,
        severity: FAILURE_JOB_STATUSES.has(job.status) ? 'failure' : 'info',
        authoritativeAt: job.finishedAt,
      })
    }
  }

  for (const wait of domain.waits ?? []) {
    if (after(wait.createdAt)) {
      items.push({
        id: `wait-created:${wait.id}`,
        entityKind: 'wait',
        entityId: wait.id,
        change: `Wait ${wait.id} created (${wait.mode})`,
        severity: 'info',
        authoritativeAt: wait.createdAt,
      })
    }
  }

  for (const group of domain.groups ?? []) {
    if (after(group.createdAt)) {
      const id = String(group.id)
      items.push({
        id: `group-created:${id}`,
        entityKind: 'job-group',
        entityId: id,
        change: `Group ${group.label} created`,
        severity: 'info',
        authoritativeAt: group.createdAt,
      })
    }
  }

  if (domain.goal?.updatedAt !== undefined && after(domain.goal.updatedAt)) {
    items.push({
      id: 'goal-updated',
      entityKind: 'goal',
      entityId: domain.goal.objective ?? 'goal',
      change: `Goal ${domain.goal.phase ?? 'updated'}${domain.goal.blockedReason === undefined ? '' : ` — ${domain.goal.blockedReason.message}`}`,
      severity: domain.goal.phase === 'blocked' ? 'attention' : 'info',
      authoritativeAt: domain.goal.updatedAt,
    })
  }

  for (const item of domain.schedules ?? []) {
    if (item.dispatched || item.scheduledAt === undefined || item.kind === 'after') continue
    const target = Date.parse(item.scheduledAt)
    if (!Number.isFinite(target)) continue
    // Became overdue during the window: target crossed since the anchor and
    // the record still has no durable dispatch.
    if (target > since && target <= nowMs) {
      items.push({
        id: `schedule-overdue:${item.id}`,
        entityKind: 'schedule',
        entityId: item.id,
        change: `Reminder ${item.id} passed its target time`,
        severity: 'attention',
        authoritativeAt: target,
      })
    }
  }

  for (const message of domain.messages ?? []) {
    if (after(message.queuedAt)) {
      items.push({
        id: `message:${message.id}`,
        entityKind: 'message',
        entityId: message.id,
        sessionId: message.senderId,
        change: `${message.senderName} → ${message.targetId} (${message.delivery})`,
        severity: 'info',
        authoritativeAt: message.queuedAt,
      })
    }
  }

  items.sort((left, right) =>
    (right.authoritativeAt ?? 0) - (left.authoritativeAt ?? 0) || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
  return { since: anchor, generatedAt: nowMs, items }
}
