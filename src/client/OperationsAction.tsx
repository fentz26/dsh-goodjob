/**
 * GoodJob operations view, browser half: one session-header action with a
 * three-section popover — Subagents, Jobs, Waits.
 *
 * Every section reads an existing channel: the subagent catalog mirror and
 * jobs mirror arrive through the sessions snapshot store, waits through the
 * `goodjob/waits` projection seat, and job output through the non-consuming
 * observe API. Opening the panel and reading any of it causes zero model
 * inference.
 * @module dsh-goodjob/client
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the `settings.plugin.item` keyed-slot declaration.
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type { IApiClient, JobOutputView, JobView, SessionId } from '@deepseek-ai/dsh-client-connection/client'
import type { InjectFace, PropsLocale, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { AgentsList, toAgentRow } from './AgentsList.tsx'
import type { AgentRow } from './AgentsList.tsx'
import { NS } from './locales.ts'
import { css } from './styles.ts'
import { WaitsList } from './WaitsList.tsx'
import type { GoodJobWaitView } from '../types.ts'

/** Business dependencies injected by the plugin registration. */
export interface OperationsInjected {
  /** The typed client API face (jobs observe + subagent control). */
  api: IApiClient
  /** Refresh this parent's subagent catalog mirror. */
  refreshSubagents(parentSessionId: SessionId): Promise<void>
  /** Open one child transcript in the existing conversation surface. */
  openChild(address: { parentSessionId: SessionId; childSessionId: SessionId; mode: 'continuable' | 'one-shot' }): void
}

/** Full props for the session-header operations action. */
export type OperationsActionProps =
  PropsRuntime<'conversation.session.header.actions'> & PropsLocale<typeof NS> & InjectFace<OperationsInjected>

/** Stable empty list so idle sessions keep one array identity. */
const NO_JOBS: readonly JobView[] = []

/** A job whose duration still ticks. */
function isLive(job: JobView): boolean {
  return job.status === 'running' || job.status === 'stopping'
}

/**
 * Session-header entry point for the unified operations view. Sections
 * collapse when their domain has nothing to show.
 * @param props - runtime slot currency, translator, and injected API.
 * @returns the trigger button and its popover.
 */
export function OperationsAction({
  sessionId, useSessions, useProjection, t, api, refreshSubagents, openChild,
}: OperationsActionProps) {
  // Locally-narrowed views of the two framework hooks; the merged prop types
  // can lag the runtime package in out-of-tree builds, so the mirrors are read
  // through their owning types directly.
  const useSessionsTyped = useSessions as unknown as <T,>(
    selector: (state: {
      jobsBySession: Record<string, readonly JobView[] | undefined>
      subagentsByParent: Record<string, unknown>
    }) => T,
  ) => T
  const jobs = useSessionsTyped(state => state.jobsBySession[sessionId]) ?? NO_JOBS
  const catalog = useSessionsTyped(state => state.subagentsByParent[sessionId])
  const waits = (useProjection('goodjob/waits') as { waits?: readonly GoodJobWaitView[] } | undefined)
    ?.waits ?? []

  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [expandedJob, setExpandedJob] = useState<JobView['id']>()
  const [jobOutput, setJobOutput] = useState<string>()
  const rootRef = useRef<HTMLDivElement>(null)

  const liveJobs = useMemo(() => jobs.filter(isLive).length, [jobs])
  const agents = useMemo(
    () => ((catalog as { entries?: readonly unknown[] } | undefined)?.entries ?? [])
      .map(toAgentRow)
      .filter((row): row is AgentRow => row !== undefined),
    [catalog],
  )

  // Opening the panel refreshes the catalog mirror once; the mirror itself is
  // the only subscription the section keeps.
  useEffect(() => {
    if (open) void refreshSubagents(sessionId)
  }, [open, sessionId, refreshSubagents])

  useEffect(() => {
    if (!open || liveJobs === 0) return
    setNow(Date.now())
    const timer = setInterval(() => { setNow(Date.now()) }, 1_000)
    return () => { clearInterval(timer) }
  }, [open, liveJobs])

  useEffect(() => {
    if (expandedJob === undefined) return
    if (!jobs.some(job => job.id === expandedJob)) setExpandedJob(undefined)
  }, [jobs, expandedJob])

  // Fetch one observation page when a row expands; the read never advances
  // the model-facing cursor.
  useEffect(() => {
    if (expandedJob === undefined) {
      setJobOutput(undefined)
      return
    }
    let cancelled = false
    void api.jobs.observe({ sessionId, jobId: expandedJob, afterSequence: 0 })
      .then((response: Awaited<ReturnType<typeof api.jobs.observe>>) => {
        if (cancelled || !response.result.ok) return
        setJobOutput(renderObserve(response.result.value))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [api, sessionId, expandedJob])

  return (
    <div ref={rootRef} className={css.root}>
      <button
        type="button"
        className={css.trigger}
        aria-expanded={open}
        aria-label={t('title')}
        onClick={() => { setOpen(current => !current) }}
      >
        <span className={css.triggerName}>GoodJob</span>
        {liveJobs > 0 ? <span className={css.liveCount}>{liveJobs}</span> : null}
      </button>
      {open
        ? (
          <div className={css.menu} role="dialog" aria-label={t('title')}>
            <section>
              <h3 className={css.heading}>{t('section.agents')}</h3>
              <AgentsList
                sessionId={String(sessionId)}
                agents={agents}
                subagentsApi={api.subagents}
                t={t}
                onOpen={childSessionId => openChild({
                  parentSessionId: sessionId,
                  childSessionId: childSessionId as SessionId,
                  mode: 'continuable',
                })}
              />
            </section>
            <section>
              <h3 className={css.heading}>{t('section.jobs')}</h3>
              {jobs.length === 0
                ? <p className={css.empty}>{t('jobs.empty')}</p>
                : (
                  <ul className={css.jobs} aria-label={t('section.jobs')}>
                    {jobs.map((job) => (
                      <li key={job.id} className={css.jobRow}>
                        <span className={`${css.jobStatus} ${isLive(job) ? css.jobLive : ''}`}>
                          {isLive(job) ? t('status.running') : job.status}
                        </span>
                        <span className={css.jobLabel} title={job.label}>{job.kind}: {job.label}</span>
                        <span className={css.jobDuration}>
                          {Math.max(0, Math.round(((job.finishedAt ?? now) - job.startedAt) / 1_000))}s
                        </span>
                        <button
                          type="button"
                          className={css.action}
                          onClick={() => {
                            setExpandedJob(current => current === job.id ? undefined : job.id)
                          }}
                        >
                          {t('jobs.logs')}
                        </button>
                        {expandedJob === job.id
                          ? <pre className={css.output}>{jobOutput ?? ''}</pre>
                          : null}
                      </li>
                    ))}
                  </ul>
                  )}
            </section>
            <section>
              <h3 className={css.heading}>{t('section.waits')}</h3>
              <WaitsList waits={waits} t={t} />
            </section>
          </div>
          )
        : null}
    </div>
  )
}

/** Join one observation page's chunks in sequence order. */
function renderObserve(value: JobOutputView): string {
  return value.chunks.map(chunk => chunk.text).join('')
}
