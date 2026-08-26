/** Unified GoodJob operations view over existing DSH capability seams. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type { IApiClient, JobOutputView, JobView, SessionId } from '@deepseek-ai/dsh-client-connection/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { Config } from '../config-types.ts'
import type {
  GoodJobGroupView,
  GoodJobOperationsSnapshot,
  GoodJobTeamMessageView,
  GoodJobWaitView,
} from '../types.ts'
import { AgentsList, toAgentRow } from './AgentsList.tsx'
import type { AgentRow } from './AgentsList.tsx'
import { GroupsList } from './GroupsList.tsx'
import { NS } from './locales.ts'
import { css } from './styles.ts'
import { TeamsList, type GoodJobRpc } from './TeamsList.tsx'
import { WaitsList } from './WaitsList.tsx'

/** Business dependencies injected by the plugin registration. */
export interface OperationsInjected {
  api: IApiClient
  rpc: GoodJobRpc
  config: Required<Config>
  refreshSubagents(parentSessionId: SessionId): Promise<void>
  openChild(address: { parentSessionId: SessionId; childSessionId: SessionId; mode: 'continuable' | 'one-shot' }): void
}

/** Full props for the session-header operations action. */
export type OperationsActionProps = PropsRuntime<'conversation.session.header.actions'>
  & PropsLocale<typeof NS> & InjectFace<OperationsInjected>

const NO_JOBS: readonly JobView[] = []

function isLive(job: JobView): boolean {
  return job.status === 'running' || job.status === 'stopping'
}

/** Session-header entry point for subagents, Jobs, groups, waits, and optional Teams. */
export function OperationsAction(props: OperationsActionProps) {
  const { sessionId, useSessions, useProjection, t, api, rpc, config, refreshSubagents, openChild } = props
  const useSessionsTyped = useSessions as unknown as <T,>(selector: (state: {
    jobsBySession: Record<string, readonly JobView[] | undefined>
    subagentsByParent: Record<string, unknown>
  }) => T) => T
  const jobs = useSessionsTyped(state => state.jobsBySession[sessionId]) ?? NO_JOBS
  const catalog = useSessionsTyped(state => state.subagentsByParent[sessionId])
  const waits = (useProjection('goodjob/waits') as { waits?: readonly GoodJobWaitView[] } | undefined)?.waits ?? []
  const groups = ((useProjection('goodjob/groups') as { groups?: readonly GoodJobGroupView[] } | undefined)?.groups ?? [])
    .filter(group => group.ownerSessionId === sessionId)
  const teamProjection = (useProjection('goodjob/teams') as {
    teams?: readonly { teamId: string; messages: readonly GoodJobTeamMessageView[] }[]
  } | undefined)?.teams?.find(team => team.teamId === sessionId)

  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [expandedJob, setExpandedJob] = useState<JobView['id']>()
  const [jobOutput, setJobOutput] = useState<string>()
  const [operations, setOperations] = useState<GoodJobOperationsSnapshot>()
  const [operationsError, setOperationsError] = useState<string>()
  const rootRef = useRef<HTMLDivElement>(null)

  const liveJobs = useMemo(() => jobs.filter(isLive).length, [jobs])
  const expandedJobState = jobs.find(job => job.id === expandedJob)
  const outputRefreshKey = config.autoFollowOutput && expandedJobState !== undefined
    ? `${expandedJobState.status}:${expandedJobState.finishedAt ?? ''}`
    : ''
  const fallbackAgents = useMemo(
    () => ((catalog as { entries?: readonly unknown[] } | undefined)?.entries ?? [])
      .map(entry => toAgentRow(entry, String(sessionId)))
      .filter((row): row is AgentRow => row !== undefined),
    [catalog, sessionId],
  )
  const agents = useMemo(
    () => operations?.descendants.map(entry => toAgentRow(entry)).filter((row): row is AgentRow => row !== undefined)
      ?? fallbackAgents,
    [operations, fallbackAgents],
  )

  const refreshOperations = useCallback(async (): Promise<void> => {
    setOperationsError(undefined)
    try {
      const result = await rpc.call('/goodjob', 'operations.describe', { sessionId: String(sessionId) })
      if (result.ok) setOperations(result.value as GoodJobOperationsSnapshot)
      else setOperationsError(result.error.message)
    } catch (error: unknown) {
      setOperationsError(error instanceof Error ? error.message : String(error))
    }
  }, [rpc, sessionId])

  useEffect(() => {
    if (!open) return
    void refreshSubagents(sessionId)
    void refreshOperations()
  }, [open, sessionId, refreshSubagents, refreshOperations])

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

  useEffect(() => {
    if (expandedJob === undefined) { setJobOutput(undefined); return }
    let cancelled = false
    const observe = async (): Promise<void> => {
      let cursor = 0
      let output = ''
      do {
        const response = await api.jobs.observe({ sessionId, jobId: expandedJob, afterSequence: cursor })
        if (!response.result.ok || cancelled) return
        output += renderObserve(response.result.value)
        cursor = response.result.value.nextSequence
        if (!response.result.value.hasMore) break
      } while (!cancelled)
      if (!cancelled) setJobOutput(output)
    }
    void observe().catch(() => {})
    return () => { cancelled = true }
  }, [api, sessionId, expandedJob, outputRefreshKey])

  const showTeam = config.showTeams && operations?.team.available === true
  return (
    <div ref={rootRef} className={css.root}>
      <button type="button" className={css.trigger} aria-expanded={open} aria-label={t('title')} onClick={() => { setOpen(value => !value) }}>
        <span className={css.triggerName}>GoodJob</span>
        {liveJobs > 0 ? <span className={css.liveCount}>{liveJobs}</span> : null}
      </button>
      {open ? (
        <div className={css.menu} role="dialog" aria-label={t('title')}>
          {config.showSubagents ? (
            <section>
              <h3 className={css.heading}>{t('section.agents')}</h3>
              <AgentsList
                agents={agents}
                subagentsApi={api.subagents}
                t={t}
                onOpen={(childSessionId) => {
                  const row = agents.find(agent => agent.id === childSessionId)
                  if (row !== undefined) openChild({
                    parentSessionId: row.parentId as SessionId,
                    childSessionId: childSessionId as SessionId,
                    mode: row.mode,
                  })
                }}
              />
            </section>
          ) : null}
          {config.showJobs ? (
            <section>
              <h3 className={css.heading}>{t('section.jobs')}</h3>
              {jobs.length === 0 ? <p className={css.empty}>{t('jobs.empty')}</p> : (
                <ul className={css.jobs} aria-label={t('section.jobs')}>
                  {jobs.map(job => (
                    <li key={job.id} className={css.jobRow}>
                      <span className={`${css.jobStatus} ${isLive(job) ? css.jobLive : ''}`}>{isLive(job) ? t('status.running') : job.status}</span>
                      <span className={css.jobLabel} title={job.label}>{job.kind}: {job.label}</span>
                      <span className={css.jobDuration}>{Math.max(0, Math.round(((job.finishedAt ?? now) - job.startedAt) / 1_000))}s</span>
                      <button type="button" className={css.action} onClick={() => { setExpandedJob(current => current === job.id ? undefined : job.id) }}>{t('jobs.logs')}</button>
                      {expandedJob === job.id ? <pre className={css.output}>{jobOutput ?? ''}</pre> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
          {config.showGroups ? (
            <section>
              <h3 className={css.heading}>Job Groups</h3>
              <GroupsList groups={groups} jobs={jobs} autoExpandActive={config.autoExpandActiveGroups} onLogs={setExpandedJob} />
            </section>
          ) : null}
          {config.showWaits ? (
            <section>
              <h3 className={css.heading}>{t('section.waits')}</h3>
              <WaitsList waits={waits} t={t} />
            </section>
          ) : null}
          {showTeam ? (
            <section>
              <h3 className={css.heading}>Agent Team</h3>
              <TeamsList
                sessionId={String(sessionId)}
                members={operations.team.members}
                tasks={operations.team.tasks}
                messages={teamProjection?.messages ?? []}
                showTasks={config.showTeamTasks}
                showMailbox={config.showTeamMailbox}
                rpc={rpc}
                onChanged={() => { void refreshOperations() }}
                onOpen={member => openChild({
                  parentSessionId: sessionId,
                  childSessionId: member.id as SessionId,
                  mode: 'continuable',
                })}
              />
            </section>
          ) : null}
          {operationsError === undefined ? null : <p className={css.error}>{operationsError}</p>}
        </div>
      ) : null}
    </div>
  )
}

function renderObserve(value: JobOutputView): string {
  return value.chunks.map(chunk => chunk.text).join('')
}
