/** Native DSH conversation view implementing the GoodJob operations workspace. */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { IApiClient, JobOutputView, JobView, SessionId } from '@deepseek-ai/dsh-client-connection/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { Config } from '../config-types.ts'
import type {
  GoodJobGroupView,
  GoodJobOperationsSnapshot,
  GoodJobRuntimeTeamMember,
  GoodJobRuntimeTeamTask,
  GoodJobScheduleRecordView,
  GoodJobTeamMessageView,
  GoodJobWaitView,
  GoodJobWorkflowRunView,
} from '../types.ts'
import { toAgentRow, type AgentRow } from './AgentsList.tsx'
import { deriveAttention, type AttentionItem } from './attention.ts'
import { NS } from './locales.ts'
import type { GoodJobRpc } from './TeamsList.tsx'
import {
  activateEntity,
  closeEntity,
  closePane,
  entityKey,
  initialWorkspaceState,
  moveEntity,
  openEntity,
  openToSide,
  restoreWorkspace,
  toggleSection,
  type WorkspaceEntity,
  type WorkspaceEntityKind,
  type WorkspacePane,
  type WorkspaceState,
} from './workspace.ts'

/** One Job paired with the Session id required by `jobs.observe`. */
export interface OwnedJob {
  sessionId: string
  job: JobView
}

/** Authoritative domain values projected into the workspace. */
export interface WorkspaceDomain {
  rootSessionId: string
  agents: readonly AgentRow[]
  jobs: readonly OwnedJob[]
  groups: readonly GoodJobGroupView[]
  waits: readonly GoodJobWaitView[]
  /** Durable Session goal from the upstream `goal` projection (null when none). */
  goal: GoodJobGoalState | null
  /** Workflow runs folded from durable `tool-workflow/*` events. */
  workflows: readonly GoodJobWorkflowRunView[]
  /** Schedule records folded from durable `schedule/change` events. */
  schedules: readonly GoodJobScheduleRecordView[]
  teamAvailable: boolean
  teamLive: boolean
  teamMembers: readonly GoodJobRuntimeTeamMember[]
  tasks: readonly GoodJobRuntimeTeamTask[]
  messages: readonly GoodJobTeamMessageView[]
}

/** The upstream `goal` projection's whole value, read structurally. */
export interface GoodJobGoalState {
  id?: string
  revision?: number
  objective?: string
  phase?: 'active' | 'paused' | 'blocked' | 'complete'
  blockedReason?: { code: string; message: string }
  maxGoalRounds?: number
  roundsStarted?: number
  createdAt?: number
  updatedAt?: number
}

/** One presentation lens discovered from the DSH conversation-view registry. */
export interface WorkspaceSessionView {
  id: string
  label: string
}

/** Runtime dependencies supplied to the native GoodJob view. */
export interface WorkspaceInjected {
  api: IApiClient
  rpc: GoodJobRpc
  config: Required<Config>
  refreshSubagents(parentSessionId: SessionId): Promise<void>
  openChild(address: { parentSessionId: SessionId; childSessionId: SessionId; mode: 'continuable' | 'one-shot' }): void
  sessionViews: {
    list(): readonly WorkspaceSessionView[]
    subscribe(listener: () => void): () => void
    version(): number
  }
}

/** Full props for the native conversation view. */
export type WorkspaceViewProps = PropsRuntime<'conversation.view'>
  & PropsLocale<typeof NS> & InjectFace<WorkspaceInjected>

/**
 * Structural face of an upstream session slot host. Unreleased DeepSeek
 * Harness builds inject this component into session-scoped slot entries so a
 * registered view can be hosted for an explicit Session; published builds
 * leave the prop undefined and GoodJob renders its own fallback instead.
 */
export type SessionSlotHostComponent = (props: {
  name: string
  sessionId: SessionId
  owner: { inspect: null; onInspectDone: () => void }
  opts?: { only?: string; fallback?: React.ReactNode }
}) => React.ReactNode

/** Props for the presentation-only workspace component used by browser tests. */
export interface GoodJobWorkspaceProps {
  domain: WorkspaceDomain
  api: IApiClient
  rpc: GoodJobRpc
  config: Required<Config>
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  onOpenSession(agent: AgentRow): void
  onRefresh(): void
  sessionViews: readonly WorkspaceSessionView[]
  sessionSlotHost?: SessionSlotHostComponent
}

const NO_JOBS: Readonly<Record<string, readonly JobView[] | undefined>> = {}
const NO_CATALOG: Readonly<Record<string, unknown>> = {}

function isLive(job: JobView): boolean {
  return job.status === 'running' || job.status === 'stopping'
}

/** Native view wrapper: subscribe to DSH mirrors and read optional runtime adapters once. */
export function WorkspaceView(props: WorkspaceViewProps) {
  const {
    sessionId, useSessions, useProjection, api, rpc, config, refreshSubagents, openChild,
    sessionViews,
  } = props
  const SessionSlotHost = (props as { SessionSlotHost?: SessionSlotHostComponent }).SessionSlotHost
  useSyncExternalStore(sessionViews.subscribe, sessionViews.version)
  const useSessionsTyped = useSessions as unknown as <T,>(selector: (state: {
    jobsBySession: Record<string, readonly JobView[] | undefined>
    subagentsByParent: Record<string, unknown>
  }) => T) => T
  const jobsBySession = useSessionsTyped(state => state.jobsBySession) ?? NO_JOBS
  const catalogs = useSessionsTyped(state => state.subagentsByParent) ?? NO_CATALOG
  const waits = (useProjection('goodjob/waits') as { waits?: readonly GoodJobWaitView[] } | undefined)?.waits ?? []
  const goal = (useProjection('goal') as GoodJobGoalState | null | undefined) ?? null
  const workflows = ((useProjection('goodjob/workflows') as { runs?: readonly GoodJobWorkflowRunView[] } | undefined)?.runs ?? []) as readonly GoodJobWorkflowRunView[]
  const schedules = ((useProjection('goodjob/schedules') as { schedules?: readonly GoodJobScheduleRecordView[] } | undefined)?.schedules ?? []) as readonly GoodJobScheduleRecordView[]
  const groups = ((useProjection('goodjob/groups') as { groups?: readonly GoodJobGroupView[] } | undefined)?.groups ?? [])
    .filter(group => group.ownerSessionId === sessionId)
  const teamProjection = (useProjection('goodjob/teams') as {
    teams?: readonly { teamId: string; messages: readonly GoodJobTeamMessageView[] }[]
  } | undefined)?.teams?.find(team => team.teamId === sessionId)
  const [operations, setOperations] = useState<GoodJobOperationsSnapshot>()

  const refresh = useCallback((): void => {
    void refreshSubagents(sessionId)
    void rpc.call('/goodjob', 'operations.describe', { sessionId: String(sessionId) })
      .then((result) => {
        if (result.ok) setOperations(result.value as GoodJobOperationsSnapshot)
      })
      .catch(() => {})
  }, [refreshSubagents, rpc, sessionId])

  useEffect(() => { refresh() }, [refresh])

  const fallbackAgents = useMemo(
    () => ((catalogs[String(sessionId)] as { entries?: readonly unknown[] } | undefined)?.entries ?? [])
      .map(entry => toAgentRow(entry, String(sessionId)))
      .filter((row): row is AgentRow => row !== undefined),
    [catalogs, sessionId],
  )
  const agents = useMemo(
    () => operations?.descendants.map(entry => toAgentRow(entry)).filter((row): row is AgentRow => row !== undefined)
      ?? fallbackAgents,
    [operations, fallbackAgents],
  )
  const relevantSessions = useMemo(() => new Set([String(sessionId), ...agents.map(agent => agent.id)]), [sessionId, agents])
  const jobs = useMemo(() => Object.entries(jobsBySession)
    .filter(([ownerSessionId]) => relevantSessions.has(ownerSessionId))
    .flatMap(([ownerSessionId, rows]) => (rows ?? []).map(job => ({ sessionId: ownerSessionId, job }))),
  [jobsBySession, relevantSessions])
  const domain: WorkspaceDomain = {
    rootSessionId: String(sessionId),
    agents,
    jobs,
    groups,
    waits,
    goal,
    workflows,
    schedules,
    teamAvailable: operations?.team.available ?? false,
    teamLive: operations?.team.live ?? false,
    teamMembers: operations?.team.members ?? [],
    tasks: operations?.team.tasks ?? [],
    messages: teamProjection?.messages ?? [],
  }
  return (
    <GoodJobWorkspace
      domain={domain}
      api={api}
      rpc={rpc}
      config={config}
      storage={typeof localStorage === 'undefined' ? undefined : localStorage}
      onRefresh={refresh}
      sessionViews={sessionViews.list()}
      sessionSlotHost={SessionSlotHost}
      onOpenSession={(agent) => {
        if (agent.id === String(sessionId)) return
        openChild({
          parentSessionId: agent.parentId as SessionId,
          childSessionId: agent.id as SessionId,
          mode: agent.mode,
        })
      }}
    />
  )
}

/** Render the IDE-style shell over current DSH projections. */
export function GoodJobWorkspace(props: GoodJobWorkspaceProps) {
  const { domain, config, storage } = props
  const storageKey = `goodjob.workspace.v1:${domain.rootSessionId}`
  const [state, setState] = useState<WorkspaceState>(() => config.restoreWorkspace
    ? restoreWorkspace(storage?.getItem(storageKey) ?? null) ?? initialWorkspaceState()
    : initialWorkspaceState())
  const [filter, setFilter] = useState('')
  const [explorerOpen, setExplorerOpen] = useState(true)

  useEffect(() => {
    if (!config.restoreWorkspace) {
      storage?.removeItem(storageKey)
      return
    }
    storage?.setItem(storageKey, JSON.stringify(state))
  }, [config.restoreWorkspace, state, storage, storageKey])

  const open = useCallback((entity: WorkspaceEntity): void => {
    setState(current => openEntity(current, entity))
    setExplorerOpen(false)
  }, [])
  const side = useCallback((entity: WorkspaceEntity, direction: 'vertical' | 'horizontal'): void => {
    setState(current => openToSide(current, entity, direction))
  }, [])
  const activeKeys = new Set(state.panes.map(pane => pane.activeKey))

  return (
    <div className="gj-workspace" data-explorer-open={explorerOpen} data-conversation-composer-overlay="">
      <Explorer
        domain={domain}
        config={config}
        filter={filter}
        activeKeys={activeKeys}
        collapsed={state.collapsedSections}
        onFilter={setFilter}
        onOpen={open}
        onToggle={(kind) => { setState(current => toggleSection(current, kind)) }}
      />
      <main className="gj-main">
        <div className="gj-workspaceToolbar gj-toolbar">
          <div className="gj-toolbar">
            <button type="button" className="gj-iconButton gj-mobileExplorerToggle" onClick={() => { setExplorerOpen(value => !value) }}>Explorer</button>
            <strong>GoodJob Workspace</strong>
            <span className="gj-meta">Session {domain.rootSessionId}</span>
          </div>
          <div className="gj-toolbar">
            <button type="button" className="gj-iconButton" onClick={props.onRefresh}>Refresh adapters</button>
          </div>
        </div>
        <div className="gj-panes" data-direction={state.direction} data-count={state.panes.length}>
          {state.panes.map(pane => (
            <EditorPane
              key={pane.id}
              pane={pane}
              focused={state.focusedPaneId === pane.id}
              state={state}
              {...props}
              onFocus={() => { setState(current => ({ ...current, focusedPaneId: pane.id })) }}
              onActivate={(key) => { setState(current => activateEntity(current, pane.id, key)) }}
              onClose={(key) => { setState(current => closeEntity(current, pane.id, key)) }}
              onOpen={open}
              onOpenSide={side}
              onClosePane={() => { setState(current => closePane(current, pane.id)) }}
              onMove={(key, targetPaneId) => { setState(current => moveEntity(current, pane.id, targetPaneId, key)) }}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

interface ExplorerProps {
  domain: WorkspaceDomain
  config: Required<Config>
  filter: string
  activeKeys: ReadonlySet<string>
  collapsed: readonly WorkspaceEntityKind[]
  onFilter(value: string): void
  onOpen(entity: WorkspaceEntity): void
  onToggle(kind: WorkspaceEntityKind): void
}

function Explorer(props: ExplorerProps) {
  const query = props.filter.trim().toLowerCase()
  const matches = (value: string): boolean => query.length === 0 || value.toLowerCase().includes(query)
  const agents = leadAndAgents(props.domain).filter(agent => matches(agent.label ?? agent.id))
  const jobs = props.domain.jobs
    .filter(row => props.config.showCompletedJobs || isLive(row.job))
    .filter(row => matches(`${row.job.kind} ${row.job.label} ${row.job.id}`))
  const groups = props.domain.groups.filter(group => matches(`${group.label} ${group.id}`))
  const waits = props.domain.waits.filter(wait => matches(wait.id))
  const goals = props.config.showGoals && props.domain.goal?.objective !== undefined
    ? [{ id: props.domain.goal.id ?? 'goal', objective: props.domain.goal.objective! }].filter(goal => matches(`${goal.objective} ${goal.id}`))
    : []
  const workflows = (props.domain.workflows ?? [])
    .filter(run => props.config.showWorkflows)
    .filter(run => matches(`${run.name} ${run.id}`))
  const schedules = (props.domain.schedules ?? [])
    .filter(item => props.config.showSchedules)
    .filter(item => matches(`${item.prompt} ${item.id}`))
  const tasks = props.config.showTeamTasks
    ? props.domain.tasks
      .filter(task => props.config.showCompletedTasks || task.status !== 'completed')
      .filter(task => matches(`${task.subject} ${task.id}`))
    : []
  return (
    <aside className="gj-explorer" aria-label="GoodJob Explorer">
      <div className="gj-explorerHeader">
        <h2 className="gj-explorerTitle">Explorer</h2>
        <button type="button" className="gj-iconButton" aria-label="Open General" onClick={() => { props.onOpen({ kind: 'general' }) }}>⌂</button>
      </div>
      <input className="gj-filter" type="search" aria-label="Filter workspace entities" placeholder="Filter agents, jobs, tasks…" value={props.filter} onChange={event => { props.onFilter(event.target.value) }} />
      <div className="gj-explorerScroll">
        <ExplorerSection label="Agents" kind="agent" collapsed={props.collapsed} onToggle={props.onToggle}>
          {agents.map(agent => (
            <ExplorerRow
              key={agent.id}
              label={agent.label ?? agent.id}
              state={agent.activity}
              entity={{ kind: 'agent', sessionId: agent.id }}
              activeKeys={props.activeKeys}
              onOpen={props.onOpen}
            />
          ))}
        </ExplorerSection>
        {props.config.showJobs ? (
          <ExplorerSection label="Jobs" kind="job" collapsed={props.collapsed} onToggle={props.onToggle}>
            {jobs.map(({ sessionId, job }) => (
              <ExplorerRow key={`${sessionId}:${job.id}`} label={job.label} state={job.status} entity={{ kind: 'job', sessionId, jobId: String(job.id) }} activeKeys={props.activeKeys} onOpen={props.onOpen} />
            ))}
          </ExplorerSection>
        ) : null}
        {props.config.showGroups ? (
          <ExplorerSection label="Job Groups" kind="job-group" collapsed={props.collapsed} onToggle={props.onToggle}>
            {groups.map(group => <ExplorerRow key={group.id} label={group.label} state={groupStatus(group, props.domain.jobs)} entity={{ kind: 'job-group', groupId: String(group.id) }} activeKeys={props.activeKeys} onOpen={props.onOpen} />)}
          </ExplorerSection>
        ) : null}
        {props.config.showWaits ? (
          <ExplorerSection label="Waits" kind="wait" collapsed={props.collapsed} onToggle={props.onToggle}>
            {waits.map(wait => <ExplorerRow key={wait.id} label={wait.id} state={wait.status} entity={{ kind: 'wait', waitId: wait.id }} activeKeys={props.activeKeys} onOpen={props.onOpen} />)}
          </ExplorerSection>
        ) : null}
        {props.config.showGoals && props.domain.goal?.objective !== undefined ? (
          <ExplorerSection label="Goals" kind="goal" collapsed={props.collapsed} onToggle={props.onToggle}>
            {goals.map(goal => (
              <ExplorerRow
                key={goal.id}
                label={goal.objective}
                state={props.domain.goal?.phase ?? 'active'}
                entity={{ kind: 'goal' }}
                activeKeys={props.activeKeys}
                onOpen={props.onOpen}
              />
            ))}
          </ExplorerSection>
        ) : null}
        {props.config.showWorkflows ? (
          <ExplorerSection label="Workflows" kind="workflow" collapsed={props.collapsed} onToggle={props.onToggle}>
            {workflows.map(run => (
              <ExplorerRow
                key={run.id}
                label={run.name}
                state={run.state === 'completed' ? 'completed' : run.state}
                entity={{ kind: 'workflow', workflowId: run.id }}
                activeKeys={props.activeKeys}
                onOpen={props.onOpen}
              />
            ))}
          </ExplorerSection>
        ) : null}
        {props.config.showSchedules ? (
          <ExplorerSection label="Schedules" kind="schedule" collapsed={props.collapsed} onToggle={props.onToggle}>
            {schedules.map(item => {
              const overdue = item.kind !== 'after' && !item.dispatched && item.scheduledAt !== undefined && Date.parse(item.scheduledAt) <= Date.now()
              return (
                <ExplorerRow
                  key={item.id}
                  label={item.prompt}
                  state={item.dispatched ? 'dispatched' : overdue ? 'overdue' : 'scheduled'}
                  entity={{ kind: 'schedule', scheduleId: item.id }}
                  activeKeys={props.activeKeys}
                  onOpen={props.onOpen}
                />
              )
            })}
          </ExplorerSection>
        ) : null}
        {props.config.showTeams && props.domain.teamAvailable && props.config.showTeamTasks ? (
          <ExplorerSection label="Tasks" kind="task" collapsed={props.collapsed} onToggle={props.onToggle}>
            {tasks.map(task => <ExplorerRow key={task.id} label={task.subject} state={taskState(task)} entity={{ kind: 'task', taskId: task.id }} activeKeys={props.activeKeys} onOpen={props.onOpen} />)}
          </ExplorerSection>
        ) : null}
      </div>
    </aside>
  )
}

function ExplorerSection(props: {
  label: string
  kind: WorkspaceEntityKind
  collapsed: readonly WorkspaceEntityKind[]
  onToggle(kind: WorkspaceEntityKind): void
  children: React.ReactNode
}) {
  const expanded = !props.collapsed.includes(props.kind)
  return (
    <section className="gj-explorerSection">
      <button type="button" className="gj-treeButton" aria-expanded={expanded} onClick={() => { props.onToggle(props.kind) }}>
        <span>{expanded ? '⌄' : '›'}</span><span className="gj-treeLabel">{props.label}</span><span />
      </button>
      {expanded ? <ul className="gj-tree">{props.children}</ul> : null}
    </section>
  )
}

function ExplorerRow(props: {
  label: string
  state: string
  entity: WorkspaceEntity
  activeKeys: ReadonlySet<string>
  onOpen(entity: WorkspaceEntity): void
}) {
  const key = entityKey(props.entity)
  return (
    <li>
      <button type="button" className="gj-treeButton" aria-current={props.activeKeys.has(key)} onClick={() => { props.onOpen(props.entity) }}>
        <span className="gj-stateDot" data-state={props.state} />
        <span className="gj-treeLabel" title={props.label}>{props.label}</span>
        <span className="gj-treeState">{props.state}</span>
      </button>
    </li>
  )
}

interface EditorPaneProps extends GoodJobWorkspaceProps {
  pane: WorkspacePane
  state: WorkspaceState
  focused: boolean
  onFocus(): void
  onActivate(key: string): void
  onClose(key: string): void
  onOpen(entity: WorkspaceEntity): void
  onOpenSide(entity: WorkspaceEntity, direction: 'vertical' | 'horizontal'): void
  onClosePane(): void
  onMove(key: string, targetPaneId: string): void
}

function EditorPane(props: EditorPaneProps) {
  const active = props.pane.tabs.find(tab => entityKey(tab) === props.pane.activeKey) ?? props.pane.tabs[0]!
  const otherPane = props.state.panes.find(pane => pane.id !== props.pane.id)
  return (
    <section className="gj-pane" data-focused={props.focused} aria-label={`Workspace ${props.pane.id}`} onPointerDown={props.onFocus}>
      <div className="gj-paneHeader">
        <div className="gj-tabs" role="tablist">
          {props.pane.tabs.map(tab => {
            const key = entityKey(tab)
            return (
              <div key={key} className="gj-tab" role="tab" aria-selected={key === props.pane.activeKey}>
                <button type="button" className="gj-linkButton gj-tabLabel" title={entityLabel(tab, props.domain)} onClick={() => { props.onActivate(key) }}>{entityLabel(tab, props.domain)}</button>
                <button type="button" className="gj-iconButton gj-tabClose" aria-label={`Close ${entityLabel(tab, props.domain)}`} onClick={() => { props.onClose(key) }}>×</button>
              </div>
            )
          })}
        </div>
        <div className="gj-paneActions">
          <button type="button" className="gj-iconButton" title="Split right" aria-label="Split right" disabled={props.state.panes.length >= 4} onClick={() => { props.onOpenSide(active, 'vertical') }}>◫</button>
          <button type="button" className="gj-iconButton" title="Split down" aria-label="Split down" disabled={props.state.panes.length >= 4} onClick={() => { props.onOpenSide(active, 'horizontal') }}>⬒</button>
          {otherPane === undefined ? null : <button type="button" className="gj-iconButton" aria-label="Move active tab to other pane" onClick={() => { props.onMove(entityKey(active), otherPane.id) }}>⇥</button>}
          <button type="button" className="gj-iconButton" aria-label="Close pane" disabled={props.state.panes.length === 1} onClick={props.onClosePane}>×</button>
        </div>
      </div>
      <div className="gj-editorStack">
        {props.pane.tabs.map(entity => (
          <div key={entityKey(entity)} className="gj-editor" hidden={entityKey(entity) !== props.pane.activeKey}>
            <EntityEditor
              {...props}
              entity={entity}
              active={entityKey(entity) === props.pane.activeKey}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

interface EntityEditorProps extends GoodJobWorkspaceProps {
  entity: WorkspaceEntity
  active: boolean
  onOpen(entity: WorkspaceEntity): void
  onOpenSide(entity: WorkspaceEntity, direction: 'vertical' | 'horizontal'): void
}

function EntityEditor(props: EntityEditorProps) {
  const { entity, domain } = props
  switch (entity.kind) {
    case 'general': return <GeneralEditor {...props} />
    case 'agent': {
      const agent = leadAndAgents(domain).find(candidate => candidate.id === entity.sessionId)
      return agent === undefined ? <UnavailableEditor entity={entity} /> : <AgentEditor {...props} agent={agent} />
    }
    case 'job': {
      const owned = domain.jobs.find(candidate => candidate.sessionId === entity.sessionId && String(candidate.job.id) === entity.jobId)
      return owned === undefined ? <UnavailableEditor entity={entity} /> : <JobEditor {...props} owned={owned} />
    }
    case 'job-group': {
      const group = domain.groups.find(candidate => String(candidate.id) === entity.groupId)
      return group === undefined ? <UnavailableEditor entity={entity} /> : <GroupEditor {...props} group={group} />
    }
    case 'wait': {
      const wait = domain.waits.find(candidate => candidate.id === entity.waitId)
      return wait === undefined ? <UnavailableEditor entity={entity} /> : <WaitEditor {...props} wait={wait} />
    }
    case 'task': {
      const task = domain.tasks.find(candidate => candidate.id === entity.taskId)
      return task === undefined ? <UnavailableEditor entity={entity} /> : <TaskEditor {...props} task={task} />
    }
    case 'goal':
      return domain.goal?.objective === undefined
        ? <UnavailableEditor entity={entity} />
        : <GoalEditor {...props} goal={domain.goal} />
    case 'workflow': {
      const run = (domain.workflows ?? []).find(candidate => candidate.id === entity.workflowId)
      return run === undefined ? <UnavailableEditor entity={entity} /> : <WorkflowEditor {...props} run={run} />
    }
    case 'schedule': {
      const item = (domain.schedules ?? []).find(candidate => candidate.id === entity.scheduleId)
      return item === undefined ? <UnavailableEditor entity={entity} /> : <ScheduleEditor {...props} item={item} />
    }
    case 'session-view': return <SessionViewEditor {...props} />
  }
}

function EditorTitle(props: {
  title: string
  subtitle?: string
  status?: string
  entity: WorkspaceEntity
  onOpenSide(entity: WorkspaceEntity, direction: 'vertical' | 'horizontal'): void
  actions?: React.ReactNode
}) {
  return (
    <header className="gj-editorHeader">
      <div>
        <h2 className="gj-title">{props.title}</h2>
        {props.subtitle === undefined ? null : <p className="gj-subtitle">{props.subtitle}</p>}
      </div>
      <div className="gj-toolbar">
        {props.status === undefined ? null : <span className="gj-badge">{props.status}</span>}
        {props.actions}
        <button type="button" className="gj-action" onClick={() => { props.onOpenSide(props.entity, 'vertical') }}>Open to side</button>
      </div>
    </header>
  )
}

function GeneralEditor(props: EntityEditorProps) {
  const { domain, config, onOpen } = props
  const allAgents = leadAndAgents(domain)
  const activeAgents = allAgents.filter(agent => agent.activity === 'running').length
  const runningJobs = domain.jobs.filter(row => isLive(row.job)).length
  const waiting = domain.waits.filter(wait => wait.status === 'pending').length
  const activeTasks = domain.tasks.filter(task => task.status === 'in_progress').length
  // One deterministic derivation feeds Needs Attention: the same blocker
  // appears exactly once regardless of how many sections could express it.
  const attention = deriveAttention({
    goal: config.showGoals ? domain.goal : null,
    jobsBySession: Object.fromEntries(domain.jobs.map(row => [row.sessionId, [row.job]])),
    tasks: domain.tasks.map(task => ({
      id: task.id,
      subject: task.subject,
      status: task.status,
      ownerId: task.ownerName,
      blockedBy: [...task.blockedBy],
    })),
    schedules: domain.schedules,
    teamUnavailable: !domain.teamAvailable || !config.showTeams,
    nowMs: Date.now(),
  })
  const attentionEntities = new Map<string, WorkspaceEntity>()
  for (const item of attention) {
    const target = item.target
    if (target.kind === 'job') attentionEntities.set(item.id, { kind: 'job', sessionId: target.sessionId, jobId: target.jobId })
    else if (target.kind === 'goal') attentionEntities.set(item.id, { kind: 'goal' })
    else if (target.kind === 'wait') attentionEntities.set(item.id, { kind: 'wait', waitId: target.waitId })
    else if (target.kind === 'task') attentionEntities.set(item.id, { kind: 'task', taskId: target.taskId })
    else attentionEntities.set(item.id, { kind: 'schedule', scheduleId: target.scheduleId })
  }
  const activities = activityEntries(domain).slice(0, 30)
  return (
    <>
      <EditorTitle title="General" subtitle={`Current projections for Session ${domain.rootSessionId}`} entity={{ kind: 'general' }} onOpenSide={props.onOpenSide} />
      <div className="gj-overview" aria-label="Operations overview">
        <Metric value={`${activeAgents} active / ${allAgents.length - activeAgents} idle`} label="Agents" />
        <Metric value={`${runningJobs} running / ${domain.jobs.length - runningJobs} settled`} label="Jobs" />
        <Metric value={`${waiting} waiting / ${domain.waits.length - waiting} settled`} label="Waits" />
        <Metric value={`${activeTasks} in progress / ${domain.tasks.filter(task => taskState(task) === 'blocked').length} blocked`} label="Tasks" />
      </div>
      {config.showGoals && domain.goal?.objective !== undefined ? (
        <section className="gj-section">
          <h3 className="gj-sectionTitle">Objectives</h3>
          <ul className="gj-list">
            <li className="gj-listRow gj-attention">
              <button type="button" className="gj-linkButton gj-rowMain" onClick={() => { onOpen({ kind: 'goal' }) }}>{domain.goal.objective}</button>
              <span className="gj-badge">{domain.goal.phase ?? 'active'}</span>
              <span className="gj-meta">{`round ${domain.goal.roundsStarted ?? 0}`}</span>
            </li>
          </ul>
        </section>
      ) : null}
      {config.showAttention ? (
        <section className="gj-section">
          <h3 className="gj-sectionTitle">Needs Attention</h3>
          {attention.length === 0 && (!config.showTeams || domain.teamAvailable)
            ? <p className="gj-quiet">Nothing requires human attention.</p>
            : (
              <ul className="gj-list">
                {attention.map(item => (
                  <li key={item.id} className="gj-listRow gj-attention">
                    <span className="gj-badge" data-severity={item.severity}>{item.reason}</span>
                    <button type="button" className="gj-linkButton gj-rowMain" onClick={() => { onOpen(attentionEntities.get(item.id)!) }}>{item.explanation}</button>
                  </li>
                ))}
                {config.showTeams && !domain.teamAvailable ? <li className="gj-listRow gj-warning">Agent Teams adapter unavailable; Team tabs and controls are hidden.</li> : null}
              </ul>
            )}
        </section>
      ) : null}
      {config.showActivityFeed ? (
        <section className="gj-section">
          <h3 className="gj-sectionTitle">Activity</h3>
          {activities.length === 0 ? <p className="gj-quiet">No timestamped activity in current projections.</p> : (
            <ul className="gj-list" aria-label="Activity feed">
              {activities.map(activity => (
                <li key={activity.key} className="gj-listRow">
                  <time className="gj-meta">{new Date(activity.time).toLocaleTimeString()}</time>
                  <button type="button" className="gj-linkButton gj-rowMain" onClick={() => { onOpen(activity.entity) }}>{activity.label}</button>
                  <span className="gj-meta">{activity.source}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {config.showGraph ? <GraphView domain={domain} onOpen={onOpen} /> : null}
    </>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="gj-metric"><span className="gj-metricValue">{value}</span><span className="gj-metricLabel">{label}</span></div>
}

function GraphView({ domain, onOpen }: { domain: WorkspaceDomain; onOpen(entity: WorkspaceEntity): void }) {
  const lead = leadAndAgents(domain)[0]!
  return (
    <section className="gj-section">
      <h3 className="gj-sectionTitle">Graph</h3>
      <ul className="gj-graph" aria-label="Operations graph">
        <GraphAgentNode agent={lead} domain={domain} onOpen={onOpen} ancestry={new Set()} root />
      </ul>
    </section>
  )
}

function GraphAgentNode(props: { agent: AgentRow; domain: WorkspaceDomain; onOpen(entity: WorkspaceEntity): void; ancestry: ReadonlySet<string>; root?: boolean }) {
  if (props.ancestry.has(props.agent.id)) return null
  const ancestry = new Set(props.ancestry).add(props.agent.id)
  const children = props.domain.agents.filter(agent => agent.parentId === props.agent.id)
  const jobs = props.domain.jobs.filter(row => row.sessionId === props.agent.id || props.agent.relatedJobIds.includes(String(row.job.id)))
  const member = props.domain.teamMembers.find(candidate => candidate.id === props.agent.id)
  const tasks = props.domain.tasks.filter(task => task.ownerName === member?.name)
  return (
    <li>
      <button type="button" className="gj-linkButton" onClick={() => { props.onOpen({ kind: 'agent', sessionId: props.agent.id }) }}>{props.agent.label ?? props.agent.id}</button>
      {children.length === 0 && jobs.length === 0 && tasks.length === 0 && !props.root ? null : (
        <ul>
          {children.map(child => <GraphAgentNode key={child.id} agent={child} domain={props.domain} onOpen={props.onOpen} ancestry={ancestry} />)}
          {jobs.map(row => <li key={`${row.sessionId}:${row.job.id}`}><button type="button" className="gj-linkButton" onClick={() => { props.onOpen({ kind: 'job', sessionId: row.sessionId, jobId: String(row.job.id) }) }}>{row.job.label} · {row.job.status}</button></li>)}
          {tasks.map(task => <li key={task.id}><button type="button" className="gj-linkButton" onClick={() => { props.onOpen({ kind: 'task', taskId: task.id }) }}>{task.subject} · {taskState(task)}</button></li>)}
          {props.root ? props.domain.waits.map(wait => (
            <li key={wait.id}>
              <button type="button" className="gj-linkButton" onClick={() => { props.onOpen({ kind: 'wait', waitId: wait.id }) }}>{wait.id} · {wait.status}</button>
              <ul>{wait.leaves.map(leaf => <GraphLeaf key={leaf.index} leaf={leaf} domain={props.domain} onOpen={props.onOpen} />)}</ul>
            </li>
          )) : null}
        </ul>
      )}
    </li>
  )
}

function GraphLeaf(props: { leaf: GoodJobWaitView['leaves'][number]; domain: WorkspaceDomain; onOpen(entity: WorkspaceEntity): void }) {
  const input = recordValue(props.leaf.input)
  const jobId = typeof input?.job_id === 'string' ? input.job_id : undefined
  const taskId = typeof input?.task_id === 'string' ? input.task_id : undefined
  const job = jobId === undefined ? undefined : props.domain.jobs.find(row => String(row.job.id) === jobId)
  const entity: WorkspaceEntity | undefined = job !== undefined
    ? { kind: 'job', sessionId: job.sessionId, jobId: String(job.job.id) }
    : taskId === undefined ? undefined : { kind: 'task', taskId }
  const label = job?.job.label ?? props.domain.tasks.find(task => task.id === taskId)?.subject ?? props.leaf.provider ?? `condition ${props.leaf.index + 1}`
  return <li>{entity === undefined ? label : <button type="button" className="gj-linkButton" onClick={() => { props.onOpen(entity) }}>{label}</button>} {props.leaf.result === undefined ? '…' : '✓'}</li>
}

function AgentEditor(props: EntityEditorProps & { agent: AgentRow }) {
  const { agent, domain } = props
  const teamMember = domain.teamMembers.find(member => member.id === agent.id)
  const relatedJobs = domain.jobs.filter(row => row.sessionId === agent.id || agent.relatedJobIds.includes(String(row.job.id)))
  const relatedTasks = domain.tasks.filter(task => task.ownerName === teamMember?.name)
  const mailbox = domain.messages.filter(message => message.senderId === agent.id || message.targetId === agent.id || message.targetId === teamMember?.name).slice(-20).reverse()
  return (
    <>
      <EditorTitle
        title={agent.label ?? agent.id}
        subtitle={`Session ${agent.id} · Parent ${agent.parentId || 'none'} · ${agent.mode}`}
        status={agent.activity}
        entity={{ kind: 'agent', sessionId: agent.id }}
        onOpenSide={props.onOpenSide}
        actions={<><SessionViewActions {...props} agent={agent} /><AgentControls {...props} agent={agent} teamMember={teamMember} /></>}
      />
      {agent.model === undefined ? null : <dl className="gj-fields"><dt>Provider/model</dt><dd>{agent.model}</dd></dl>}
      <WhyIdle agent={agent} domain={domain} onOpen={props.onOpen} />
      <section className="gj-section">
        <h3 className="gj-sectionTitle">Transcript / Activity</h3>
        <p className="gj-quiet">Session messages and tool calls remain in the DSH conversation. Open Session navigates to that authoritative transcript.</p>
      </section>
      <RelatedList title="Jobs" empty="No related Jobs." rows={relatedJobs.map(row => ({ key: `${row.sessionId}:${row.job.id}`, label: row.job.label, state: row.job.status, entity: { kind: 'job', sessionId: row.sessionId, jobId: String(row.job.id) } }))} onOpen={props.onOpen} />
      <RelatedList title="Tasks" empty="No owned Team tasks." rows={relatedTasks.map(task => ({ key: task.id, label: task.subject, state: taskState(task), entity: { kind: 'task', taskId: task.id } }))} onOpen={props.onOpen} />
      {props.config.showTeamMailbox ? (
        <section className="gj-section">
          <h3 className="gj-sectionTitle">Mailbox</h3>
          {mailbox.length === 0 ? <p className="gj-quiet">No mailbox activity for this agent.</p> : (
            <ul className="gj-list">
              {mailbox.map(message => <li key={message.id} className="gj-listRow gj-mailMessage"><span className="gj-meta">{message.senderName} → {message.targetId}</span><span className="gj-rowMain gj-mailText">{message.text}</span><span className="gj-meta">{message.delivery} · {message.delivered ? 'delivered' : 'queued'}</span>{teamMember?.role === 'teammate' ? <TeamReply {...props} targetName={teamMember.name} /> : null}</li>)}
            </ul>
          )}
        </section>
      ) : null}
    </>
  )
}

/** Deterministic "Why is this agent idle?" panel: graph-derived only. */
function WhyIdle(props: { agent: AgentRow; domain: WorkspaceDomain; onOpen(entity: WorkspaceEntity): void }) {
  const reasons: React.ReactNode[] = []
  if (props.agent.activity !== 'running') {
    const pending = props.domain.waits.filter(wait => wait.sessionId === props.agent.id && wait.status === 'pending')
    for (const wait of pending) {
      reasons.push(
        <li key={`wait:${wait.id}`} className="gj-listRow">
          <button type="button" className="gj-linkButton gj-rowMain" onClick={() => { props.onOpen({ kind: 'wait', waitId: wait.id }) }}>{`Waiting on ${wait.id}`}</button>
          <span className="gj-meta">{`mode ${wait.mode} · ${wait.leaves.filter(leaf => leaf.result === undefined).length}/${wait.leaves.length} leaves unresolved`}</span>
        </li>,
      )
    }
  }
  return (
    <section className="gj-section">
      <h3 className="gj-sectionTitle">Why idle?</h3>
      {reasons.length === 0
        ? <p className="gj-quiet">No authoritative blocker derives from current projections.</p>
        : <ul className="gj-list" aria-label="Deterministic idle reasons">{reasons}</ul>}
    </section>
  )
}

function SessionViewActions(props: EntityEditorProps & { agent: AgentRow }) {
  const views = props.sessionViews.filter(view => view.id !== 'goodjob')
  return views.length === 0 ? null : (
    <div className="gj-toolbar" aria-label={`Session views for ${props.agent.label ?? props.agent.id}`}>
      {views.map(view => {
        const entity: WorkspaceEntity = {
          kind: 'session-view', sessionId: props.agent.id, viewId: view.id,
        }
        return (
          <span className="gj-toolbar" key={view.id}>
            <button type="button" className="gj-action" onClick={() => { props.onOpen(entity) }}>Open {view.label}</button>
            <button type="button" className="gj-iconButton" aria-label={`Open ${view.label} to side`} onClick={() => { props.onOpenSide(entity, 'vertical') }}>◫</button>
          </span>
        )
      })}
    </div>
  )
}

function TeamReply(props: GoodJobWorkspaceProps & { targetName: string }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [delivery, setDelivery] = useState<'quiet' | 'wakeup'>('quiet')
  const [busy, setBusy] = useState(false)
  const send = async (): Promise<void> => {
    if (draft.trim().length === 0) return
    setBusy(true)
    try {
      const result = await props.rpc.call('/goodjob', 'team.message', {
        sessionId: props.domain.rootSessionId,
        target: props.targetName,
        delivery,
        text: draft.trim(),
      })
      if (result.ok) {
        setDraft('')
        setOpen(false)
        props.onRefresh()
      }
    } finally {
      setBusy(false)
    }
  }
  return open ? (
    <span className="gj-toolbar">
      <input aria-label={`Reply to ${props.targetName}`} value={draft} onChange={event => { setDraft(event.target.value) }} />
      <select aria-label="Reply delivery" value={delivery} onChange={event => { setDelivery(event.target.value as 'quiet' | 'wakeup') }}><option value="quiet">Quiet</option><option value="wakeup">Wake</option></select>
      <button type="button" className="gj-action" disabled={busy || draft.trim().length === 0} onClick={() => { void send() }}>Send reply</button>
    </span>
  ) : <button type="button" className="gj-action" onClick={() => { setOpen(true) }}>Reply</button>
}

function AgentControls(props: GoodJobWorkspaceProps & { agent: AgentRow; teamMember?: GoodJobRuntimeTeamMember }) {
  const { agent, teamMember } = props
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState('')
  const [delivery, setDelivery] = useState<'quiet' | 'wakeup'>('quiet')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const root = agent.id === props.domain.rootSessionId

  const send = async (): Promise<void> => {
    const text = draft.trim()
    if (text.length === 0) return
    setBusy(true)
    setError(undefined)
    try {
      if (teamMember?.role === 'teammate') {
        const result = await props.rpc.call('/goodjob', 'team.message', {
          sessionId: props.domain.rootSessionId,
          target: teamMember.name,
          delivery,
          text,
        })
        if (!result.ok) throw new Error(result.error.message)
        props.onRefresh()
      } else {
        await props.api.subagents.prompt({
          parentSessionId: agent.parentId as SessionId,
          childSessionId: agent.id as SessionId,
          mode: 'continuable',
          content: [{ type: 'text', text }],
        })
      }
      setDraft('')
      setComposing(false)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const interrupt = async (): Promise<void> => {
    if (!window.confirm('Interrupt the current turn? The session remains continuable.')) return
    setBusy(true)
    try {
      if (teamMember?.role === 'teammate') {
        const result = await props.rpc.call('/goodjob', 'team.interrupt', { sessionId: props.domain.rootSessionId, target: teamMember.name })
        if (!result.ok) throw new Error(result.error.message)
        props.onRefresh()
      } else {
        await props.api.subagents.interrupt({ parentSessionId: agent.parentId as SessionId, childSessionId: agent.id as SessionId, mode: 'continuable' })
      }
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gj-toolbar">
      {root ? <span className="gj-meta">Current Session</span> : <button type="button" className="gj-action" onClick={() => { props.onOpenSession(agent) }}>Open Session</button>}
      {root || agent.mode !== 'continuable' ? null : <button type="button" className="gj-action" onClick={() => { setComposing(value => !value) }}>Message</button>}
      {root || agent.mode !== 'continuable' ? null : <button type="button" className="gj-action" disabled={busy} onClick={() => { void interrupt() }}>Interrupt</button>}
      {composing ? (
        <div className="gj-composer">
          <textarea className="gj-composerInput" aria-label={`Message ${agent.label ?? agent.id}`} rows={2} value={draft} onChange={event => { setDraft(event.target.value) }} />
          <div className="gj-composerRow">
            {teamMember?.role === 'teammate' ? <select aria-label="Delivery" value={delivery} onChange={event => { setDelivery(event.target.value as 'quiet' | 'wakeup') }}><option value="quiet">Quiet</option><option value="wakeup">Wake</option></select> : null}
            <button type="button" className="gj-action" disabled={busy || draft.trim().length === 0} onClick={() => { void send() }}>Send</button>
          </div>
          {error === undefined ? null : <p className="gj-error">{error}</p>}
        </div>
      ) : null}
    </div>
  )
}

function RelatedList(props: { title: string; empty: string; rows: readonly { key: string; label: string; state: string; entity: WorkspaceEntity }[]; onOpen(entity: WorkspaceEntity): void }) {
  return (
    <section className="gj-section">
      <h3 className="gj-sectionTitle">{props.title}</h3>
      {props.rows.length === 0 ? <p className="gj-quiet">{props.empty}</p> : (
        <ul className="gj-list">{props.rows.map(row => <li key={row.key} className="gj-listRow"><span className="gj-stateDot" data-state={row.state} /><button type="button" className="gj-linkButton gj-rowMain" onClick={() => { props.onOpen(row.entity) }}>{row.label}</button><span className="gj-meta">{row.state}</span></li>)}</ul>
      )}
    </section>
  )
}

function JobEditor(props: EntityEditorProps & { owned: OwnedJob }) {
  const { owned, config, active } = props
  const [output, setOutput] = useState('')
  const [observedJob, setObservedJob] = useState(owned.job)
  const [truncated, setTruncated] = useState(false)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const cursor = useRef(0)

  useEffect(() => { setObservedJob(owned.job) }, [owned.job])
  useEffect(() => {
    if (!active) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const observe = async (): Promise<void> => {
      do {
        const response = await props.api.jobs.observe({
          sessionId: owned.sessionId as SessionId,
          jobId: owned.job.id,
          afterSequence: cursor.current,
        })
        if (cancelled || !response.result.ok) return
        const value: JobOutputView = response.result.value
        cursor.current = value.nextSequence
        setObservedJob(value.job)
        if (value.truncated) setTruncated(true)
        const addition = value.chunks.map(chunk => chunk.text).join('')
        if (addition.length > 0) {
          setOutput((previous) => {
            const combined = previous + addition
            if (combined.length <= config.maxRenderedOutputChars) return combined
            setTruncated(true)
            return combined.slice(-config.maxRenderedOutputChars)
          })
        }
        if (value.hasMore) continue
        if (config.autoFollowOutput && isLive(value.job)) {
          timer = setTimeout(() => { void observe() }, config.outputObserveIntervalMs)
        }
        return
      } while (!cancelled)
    }
    void observe().catch(() => {})
    return () => {
      cancelled = true
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [active, config.autoFollowOutput, config.maxRenderedOutputChars, config.outputObserveIntervalMs, owned.job.id, owned.sessionId, props.api.jobs])

  const visibleOutput = query.trim().length === 0
    ? output
    : output.split('\n').filter(line => line.toLowerCase().includes(query.trim().toLowerCase())).join('\n')
  return (
    <>
      <EditorTitle title={observedJob.label} subtitle={`Job ${observedJob.id} · ${observedJob.kind} · Owner Session ${owned.sessionId}`} status={observedJob.status} entity={{ kind: 'job', sessionId: owned.sessionId, jobId: String(observedJob.id) }} onOpenSide={props.onOpenSide} />
      <dl className="gj-fields">
        <dt>Started</dt><dd>{new Date(observedJob.startedAt).toLocaleString()}</dd>
        <dt>Elapsed</dt><dd>{formatElapsed(observedJob.startedAt, observedJob.finishedAt)}</dd>
        {observedJob.detail === undefined ? null : <><dt>Detail</dt><dd>{observedJob.detail}</dd></>}
      </dl>
      <section className="gj-section">
        <h3 className="gj-sectionTitle">Live Output</h3>
        <div className="gj-logToolbar">
          <input className="gj-filter" style={{ margin: 0, width: '100%' }} type="search" aria-label="Search Job output" placeholder="Search output" value={query} onChange={event => { setQuery(event.target.value) }} />
          <button type="button" className="gj-action" onClick={() => {
            void navigator.clipboard?.writeText(output).then(() => { setCopied(true) })
          }}>{copied ? 'Copied' : 'Copy'}</button>
          {truncated ? <span className="gj-warning">Older retained output is truncated.</span> : null}
        </div>
        <pre className="gj-log" aria-label={`Output for ${observedJob.label}`}>{visibleOutput}</pre>
      </section>
    </>
  )
}

function GroupEditor(props: EntityEditorProps & { group: GoodJobGroupView }) {
  const jobs = new Map(props.domain.jobs.map(row => [String(row.job.id), row]))
  const settled = props.group.jobIds.filter(id => {
    const job = jobs.get(id)?.job
    return job !== undefined && !isLive(job)
  }).length
  return (
    <>
      <EditorTitle title={props.group.label} subtitle={`Job Group ${props.group.id} · revision ${props.group.revision}`} status={`${settled} / ${props.group.jobIds.length} settled`} entity={{ kind: 'job-group', groupId: String(props.group.id) }} onOpenSide={props.onOpenSide} />
      <section className="gj-section"><h3 className="gj-sectionTitle">Members</h3><ul className="gj-list">
        {props.group.jobIds.map((id) => {
          const row = jobs.get(id)
          return <li key={id} className="gj-listRow"><span className="gj-stateDot" data-state={row?.job.status ?? 'unavailable'} /><button type="button" className="gj-linkButton gj-rowMain" disabled={row === undefined} onClick={() => { if (row !== undefined) props.onOpen({ kind: 'job', sessionId: row.sessionId, jobId: String(row.job.id) }) }}>{row?.job.label ?? id}</button><span className="gj-meta">{row?.job.status ?? 'unavailable'}</span></li>
        })}
      </ul></section>
    </>
  )
}

function WaitEditor(props: EntityEditorProps & { wait: GoodJobWaitView }) {
  return (
    <>
      <EditorTitle title={props.wait.id} subtitle={`Created ${new Date(props.wait.createdAt).toLocaleString()}`} status={props.wait.status} entity={{ kind: 'wait', waitId: props.wait.id }} onOpenSide={props.onOpenSide} />
      <dl className="gj-fields"><dt>Mode</dt><dd>{props.wait.mode.toUpperCase()}</dd>{props.wait.winnerIndex === undefined ? null : <><dt>Winning leaf</dt><dd>#{props.wait.winnerIndex}</dd></>}</dl>
      <section className="gj-section"><h3 className="gj-sectionTitle">Conditions</h3><ul className="gj-list">
        {props.wait.leaves.map(leaf => {
          const linked = leafEntity(leaf, props.domain)
          return <li key={leaf.index} className="gj-listRow"><span>{leaf.result === undefined ? '…' : '✓'}</span>{linked === undefined ? <span className="gj-rowMain">{leaf.provider ?? `condition ${leaf.index + 1}`}</span> : <button type="button" className="gj-linkButton gj-rowMain" onClick={() => { props.onOpen(linked) }}>{leafLabel(leaf, props.domain)}</button>}<span className="gj-meta">{leaf.result === undefined ? 'pending' : 'settled'}</span></li>
        })}
      </ul></section>
    </>
  )
}

function TaskEditor(props: EntityEditorProps & { task: GoodJobRuntimeTeamTask }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const reassign = async (owner: string): Promise<void> => {
    setBusy(true)
    setError(undefined)
    try {
      const result = await props.rpc.call('/goodjob', 'team.reassign', {
        sessionId: props.domain.rootSessionId,
        taskId: props.task.id,
        expectedRevision: props.task.revision,
        owner,
      })
      if (!result.ok) throw new Error(result.error.message)
      props.onRefresh()
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }
  const owner = props.domain.teamMembers.find(member => member.name === props.task.ownerName)
  return (
    <>
      <EditorTitle title={props.task.subject} subtitle={`Team task ${props.task.id} · revision ${props.task.revision}`} status={taskState(props.task)} entity={{ kind: 'task', taskId: props.task.id }} onOpenSide={props.onOpenSide} />
      <p>{props.task.description}</p>
      <dl className="gj-fields">
        <dt>Owner</dt><dd>{owner === undefined ? (props.task.ownerName ?? 'Unassigned') : <button type="button" className="gj-linkButton" onClick={() => { props.onOpen({ kind: 'agent', sessionId: owner.id }) }}>{owner.name}</button>}</dd>
        <dt>Ready</dt><dd>{props.task.ready ? 'yes' : 'no'}</dd>
        <dt>Blocked by</dt><dd>{props.task.blockedBy.length === 0 ? 'none' : props.task.blockedBy.map((id, index) => <span key={id}>{index > 0 ? ', ' : ''}<button type="button" className="gj-linkButton" onClick={() => { props.onOpen({ kind: 'task', taskId: id }) }}>{id}</button></span>)}</dd>
        <dt>Write scopes</dt><dd>{props.task.writeScopes.join(', ') || 'none'}</dd>
      </dl>
      <section className="gj-section"><h3 className="gj-sectionTitle">Reassign</h3><select aria-label={`Reassign ${props.task.subject}`} value={props.task.ownerName ?? ''} disabled={busy || props.task.status === 'completed' || props.task.status === 'deleted'} onChange={event => { void reassign(event.target.value) }}><option value="">Unassigned</option>{props.domain.teamMembers.map(member => <option key={member.id} value={member.name}>{member.name}</option>)}</select>{error === undefined ? null : <p className="gj-error">{error}</p>}</section>
    </>
  )
}

function GoalEditor(props: EntityEditorProps & { goal: GoodJobGoalState }) {
  const goal = props.goal
  if (goal.objective === undefined) return <UnavailableEditor entity={{ kind: 'goal' }} />
  return (
    <>
      <EditorTitle title={goal.objective} subtitle={`Session goal${goal.id === undefined ? '' : ` ${goal.id}`} · revision ${goal.revision ?? '?'}`} status={goal.phase ?? 'active'} entity={{ kind: 'goal' }} onOpenSide={props.onOpenSide} />
      {goal.blockedReason === undefined ? null : (
        <section className="gj-section">
          <h3 className="gj-sectionTitle">Blocked</h3>
          <p className="gj-warning">{`${goal.blockedReason.code}: ${goal.blockedReason.message}`}</p>
        </section>
      )}
      <dl className="gj-fields">
        {goal.maxGoalRounds === undefined ? null : <><dt>Round cap</dt><dd>{String(goal.maxGoalRounds)}</dd></>}
        <dt>Rounds admitted</dt><dd>{String(goal.roundsStarted ?? 0)}</dd>
        {goal.createdAt === undefined ? null : <><dt>Created</dt><dd><time dateTime={new Date(goal.createdAt).toISOString()}>{new Date(goal.createdAt).toLocaleString()}</time></dd></>}
        {goal.updatedAt === undefined ? null : <><dt>Updated</dt><dd><time dateTime={new Date(goal.updatedAt).toISOString()}>{new Date(goal.updatedAt).toLocaleString()}</time></dd></>}
      </dl>
    </>
  )
}

function WorkflowEditor(props: EntityEditorProps & { run: GoodJobWorkflowRunView }) {
  const run = props.run
  // Objective settlement facts only: never a percentage the events did not carry.
  const settled = run.members.filter(member => member.outcome !== undefined)
  const failed = run.members.filter(member => member.outcome === 'failed').length
  return (
    <>
      <EditorTitle title={run.name} subtitle={`Workflow run ${run.id}`} status={run.state} entity={{ kind: 'workflow', workflowId: run.id }} onOpenSide={props.onOpenSide} />
      <dl className="gj-fields">
        <dt>Members</dt><dd>{`${settled.length}/${run.members.length} settled`}</dd>
        {failed > 0 ? <><dt>Failed members</dt><dd>{String(failed)}</dd></> : null}
        {run.stopReason === undefined ? null : <><dt>Stop reason</dt><dd>{run.stopReason}</dd></>}
      </dl>
      <section className="gj-section">
        <h3 className="gj-sectionTitle">Members</h3>
        {run.members.length === 0 ? <p className="gj-quiet">No member published yet.</p> : (
          <ul className="gj-list" aria-label="Workflow members">
            {run.members.map(member => {
              const child = leadAndAgents(props.domain).find(candidate => candidate.id === member.childId)
              return (
                <li key={`${run.id}:${member.seq}`} className="gj-listRow">
                  <span className="gj-stateDot" data-state={member.outcome ?? 'running'} />
                  <span>{member.seq}. {member.label}{member.phase === undefined ? '' : ` (${member.phase})`}</span>
                  <button type="button" className="gj-linkButton gj-rowMain" onClick={() => { props.onOpen({ kind: 'agent', sessionId: member.childId }) }}>{child?.label ?? member.childId}</button>
                  <span className="gj-meta">{member.outcome ?? 'running'}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <p className="gj-quiet">Members and outcomes come from durable `tool-workflow` Session events; timing fields are not recorded by the source events.</p>
    </>
  )
}

function ScheduleEditor(props: EntityEditorProps & { item: GoodJobScheduleRecordView }) {
  const item = props.item
  const overdue = item.kind !== 'after' && !item.dispatched && item.scheduledAt !== undefined && Date.parse(item.scheduledAt) <= Date.now()
  const state = item.dispatched ? 'dispatched' : overdue ? 'overdue' : 'scheduled'
  return (
    <>
      <EditorTitle title={item.prompt} subtitle={`Schedule ${item.id}`} status={state} entity={{ kind: 'schedule', scheduleId: item.id }} onOpenSide={props.onOpenSide} />
      <dl className="gj-fields">
        <dt>Rule</dt><dd>{item.kind === 'after' ? `${item.delayedSeconds ?? '?'} seconds after creation` : item.kind === 'every' ? `every ${item.everySeconds ?? '?'} seconds` : 'at an absolute time'}</dd>
        {item.scheduledAt === undefined ? null : <><dt>Next target</dt><dd><time dateTime={new Date(item.scheduledAt).toISOString()}>{new Date(item.scheduledAt).toLocaleString()}</time></dd></>}
        <dt>Delivery</dt><dd>session-local (the original session must be live)</dd>
      </dl>
      <p className="gj-quiet">Records fold from durable `schedule/change` Session events; GoodJob projects them read-only and owns no scheduling authority.</p>
    </>
  )
}

function SessionViewEditor(props: EntityEditorProps) {
  if (props.entity.kind !== 'session-view') return null
  const entity = props.entity
  const agent = leadAndAgents(props.domain).find(candidate => candidate.id === entity.sessionId)
  const registration = props.sessionViews.find(view => view.id === entity.viewId)
  const label = registration?.label ?? entity.viewId
  const fallback = (
    <div className="gj-sessionViewUnavailable" role="status">
      <h3 className="gj-sectionTitle">View unavailable</h3>
      <p className="gj-quiet">The registered conversation view “{entity.viewId}” is not currently available. The workspace tab retains only its presentation identity and will recover if the plugin registers the view again.</p>
    </div>
  )
  const Host = props.sessionSlotHost
  return (
    <>
      <EditorTitle
        title={`${agent?.label ?? entity.sessionId} / ${label}`}
        subtitle={`Session ${entity.sessionId} · registered conversation view ${entity.viewId}`}
        entity={entity}
        onOpenSide={props.onOpenSide}
      />
      <div className="gj-sessionViewHost">
        {Host === undefined ? fallback : (
          <Host
            name="conversation.view"
            sessionId={entity.sessionId as SessionId}
            owner={{ inspect: null, onInspectDone: () => {} }}
            opts={{ only: entity.viewId, fallback }}
          />
        )}
      </div>
    </>
  )
}

function UnavailableEditor({ entity }: { entity: WorkspaceEntity }) {
  return <><h2 className="gj-title">Unavailable</h2><p className="gj-quiet">{entityKey(entity)} is no longer present in the current DSH projection. Close this presentation tab or refresh the owning capability.</p></>
}

function leadAndAgents(domain: WorkspaceDomain): AgentRow[] {
  return [{
    id: domain.rootSessionId,
    parentId: '',
    depth: 0,
    label: 'Lead',
    mode: 'continuable',
    activity: domain.agents.some(agent => agent.activity === 'running') || domain.jobs.some(row => row.sessionId === domain.rootSessionId && isLive(row.job)) ? 'running' : 'inactive',
    relatedJobIds: domain.jobs.filter(row => row.sessionId === domain.rootSessionId).map(row => String(row.job.id)),
  }, ...domain.agents]
}

function entityLabel(entity: WorkspaceEntity, domain: WorkspaceDomain): string {
  switch (entity.kind) {
    case 'general': return 'General'
    case 'agent': return leadAndAgents(domain).find(agent => agent.id === entity.sessionId)?.label ?? entity.sessionId
    case 'job': return domain.jobs.find(row => row.sessionId === entity.sessionId && String(row.job.id) === entity.jobId)?.job.label ?? entity.jobId
    case 'job-group': return domain.groups.find(group => String(group.id) === entity.groupId)?.label ?? entity.groupId
    case 'wait': return entity.waitId
    case 'task': return domain.tasks.find(task => task.id === entity.taskId)?.subject ?? entity.taskId
    case 'goal': return domain.goal?.objective ?? 'Goal'
    case 'workflow': return (domain.workflows ?? []).find(run => run.id === entity.workflowId)?.name ?? entity.workflowId
    case 'schedule': return (domain.schedules ?? []).find(item => item.id === entity.scheduleId)?.prompt ?? entity.scheduleId
    case 'session-view': {
      const agent = leadAndAgents(domain).find(candidate => candidate.id === entity.sessionId)
      return `${agent?.label ?? entity.sessionId} / ${entity.viewId}`
    }
  }
}

function taskState(task: GoodJobRuntimeTeamTask): string {
  return task.status === 'pending' && task.blockedBy.length > 0 ? 'blocked' : task.status
}

function groupStatus(group: GoodJobGroupView, jobs: readonly OwnedJob[]): string {
  const byId = new Map(jobs.map(row => [String(row.job.id), row.job]))
  const members = group.jobIds.map(id => byId.get(id))
  if (members.some(job => job?.status === 'failed')) return 'failed'
  if (members.some(job => job !== undefined && isLive(job))) return 'running'
  return members.every(job => job?.status === 'completed') ? 'completed' : 'settled'
}

interface ActivityEntry {
  key: string
  time: number
  source: 'Jobs' | 'Waits' | 'Groups' | 'Teams'
  label: string
  entity: WorkspaceEntity
}

function activityEntries(domain: WorkspaceDomain): ActivityEntry[] {
  const entries: ActivityEntry[] = []
  for (const { sessionId, job } of domain.jobs) {
    entries.push({ key: `job-start:${sessionId}:${job.id}`, time: job.startedAt, source: 'Jobs', label: `${job.label} started`, entity: { kind: 'job', sessionId, jobId: String(job.id) } })
    if (job.finishedAt !== undefined) entries.push({ key: `job-finish:${sessionId}:${job.id}`, time: job.finishedAt, source: 'Jobs', label: `${job.label} ${job.status}`, entity: { kind: 'job', sessionId, jobId: String(job.id) } })
  }
  for (const wait of domain.waits) entries.push({ key: `wait:${wait.id}`, time: wait.createdAt, source: 'Waits', label: `${wait.id} created (${wait.mode.toUpperCase()})`, entity: { kind: 'wait', waitId: wait.id } })
  for (const group of domain.groups) entries.push({ key: `group:${group.id}`, time: group.createdAt, source: 'Groups', label: `${group.label} created`, entity: { kind: 'job-group', groupId: String(group.id) } })
  for (const message of domain.messages) entries.push({ key: `message:${message.id}`, time: message.queuedAt, source: 'Teams', label: `${message.senderName} messaged ${message.targetId} (${message.delivery})`, entity: message.senderId === domain.rootSessionId ? { kind: 'agent', sessionId: domain.rootSessionId } : { kind: 'agent', sessionId: message.senderId } })
  return entries.sort((left, right) => right.time - left.time)
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function leafEntity(leaf: GoodJobWaitView['leaves'][number], domain: WorkspaceDomain): WorkspaceEntity | undefined {
  const input = recordValue(leaf.input)
  const jobId = typeof input?.job_id === 'string' ? input.job_id : undefined
  if (jobId !== undefined) {
    const job = domain.jobs.find(row => String(row.job.id) === jobId)
    if (job !== undefined) return { kind: 'job', sessionId: job.sessionId, jobId }
  }
  const taskId = typeof input?.task_id === 'string' ? input.task_id : undefined
  return taskId === undefined ? undefined : { kind: 'task', taskId }
}

function leafLabel(leaf: GoodJobWaitView['leaves'][number], domain: WorkspaceDomain): string {
  const entity = leafEntity(leaf, domain)
  if (entity?.kind === 'job') return domain.jobs.find(row => String(row.job.id) === entity.jobId)?.job.label ?? entity.jobId
  if (entity?.kind === 'task') return domain.tasks.find(task => task.id === entity.taskId)?.subject ?? entity.taskId
  return leaf.provider ?? `condition ${leaf.index + 1}`
}

function formatElapsed(startedAt: number, finishedAt?: number): string {
  const total = Math.max(0, Math.floor(((finishedAt ?? Date.now()) - startedAt) / 1_000))
  const seconds = total % 60
  const minutes = Math.floor(total / 60) % 60
  const hours = Math.floor(total / 3_600)
  return hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}
