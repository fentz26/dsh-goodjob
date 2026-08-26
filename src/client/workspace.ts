/**
 * Presentation-only GoodJob workspace state.
 *
 * Entity identities contain the authoritative DSH ids needed to resolve a
 * fresh projection. Tabs and panes never retain Job, Agent, Wait, or Team
 * state.
 * @module dsh-goodjob/client/workspace
 */

/** Entity kinds that can occupy a GoodJob editor tab. */
export type WorkspaceEntityKind = 'general' | 'agent' | 'job' | 'job-group' | 'wait' | 'task'

/** Stable identity of one editor subject. */
export type WorkspaceEntity =
  | { kind: 'general' }
  | { kind: 'agent'; sessionId: string }
  | { kind: 'job'; sessionId: string; jobId: string }
  | { kind: 'job-group'; groupId: string }
  | { kind: 'wait'; waitId: string }
  | { kind: 'task'; taskId: string }

/** Stable client identity for deduplication and persistence. */
export function entityKey(entity: WorkspaceEntity): string {
  switch (entity.kind) {
    case 'general': return 'general'
    case 'agent': return `agent:${entity.sessionId}`
    case 'job': return `job:${entity.sessionId}:${entity.jobId}`
    case 'job-group': return `group:${entity.groupId}`
    case 'wait': return `wait:${entity.waitId}`
    case 'task': return `task:${entity.taskId}`
  }
}

/** One editor pane; tabs are unique inside the pane but may appear in another pane. */
export interface WorkspacePane {
  id: string
  tabs: readonly WorkspaceEntity[]
  activeKey: string
}

/** Persistable GoodJob presentation state. */
export interface WorkspaceState {
  direction: 'single' | 'vertical' | 'horizontal'
  panes: readonly WorkspacePane[]
  focusedPaneId: string
  collapsedSections: readonly WorkspaceEntityKind[]
}

/** Fresh workspace with General selected. */
export function initialWorkspaceState(): WorkspaceState {
  return {
    direction: 'single',
    panes: [{ id: 'pane-1', tabs: [{ kind: 'general' }], activeKey: 'general' }],
    focusedPaneId: 'pane-1',
    collapsedSections: [],
  }
}

/** Return the pane that currently owns keyboard and ordinary-open placement. */
export function focusedPane(state: WorkspaceState): WorkspacePane {
  return state.panes.find(pane => pane.id === state.focusedPaneId) ?? state.panes[0] ?? initialWorkspaceState().panes[0]!
}

/** Open or focus an entity without duplicating it across panes. */
export function openEntity(state: WorkspaceState, entity: WorkspaceEntity): WorkspaceState {
  const key = entityKey(entity)
  const existing = state.panes.find(pane => pane.tabs.some(tab => entityKey(tab) === key))
  if (existing !== undefined) return activateEntity(state, existing.id, key)
  const target = focusedPane(state)
  return {
    ...state,
    panes: state.panes.map(pane => pane.id === target.id
      ? { ...pane, tabs: [...pane.tabs, entity], activeKey: key }
      : pane),
  }
}

/** Focus one existing tab and its pane. */
export function activateEntity(state: WorkspaceState, paneId: string, key: string): WorkspaceState {
  const pane = state.panes.find(candidate => candidate.id === paneId)
  if (pane === undefined || !pane.tabs.some(tab => entityKey(tab) === key)) return state
  return {
    ...state,
    focusedPaneId: paneId,
    panes: state.panes.map(candidate => candidate.id === paneId
      ? { ...candidate, activeKey: key }
      : candidate),
  }
}

/** Close one tab, retaining General when it is the pane's last tab. */
export function closeEntity(state: WorkspaceState, paneId: string, key: string): WorkspaceState {
  const pane = state.panes.find(candidate => candidate.id === paneId)
  if (pane === undefined) return state
  const index = pane.tabs.findIndex(tab => entityKey(tab) === key)
  if (index === -1) return state
  let tabs = pane.tabs.filter(tab => entityKey(tab) !== key)
  if (tabs.length === 0) tabs = [{ kind: 'general' }]
  const nextActive = pane.activeKey === key
    ? entityKey(tabs[Math.min(index, tabs.length - 1)]!)
    : pane.activeKey
  return {
    ...state,
    panes: state.panes.map(candidate => candidate.id === paneId
      ? { ...candidate, tabs, activeKey: nextActive }
      : candidate),
  }
}

/** Open an entity in a new pane, allowing the same entity in two panes. */
export function openToSide(
  state: WorkspaceState,
  entity: WorkspaceEntity,
  direction: 'vertical' | 'horizontal',
): WorkspaceState {
  if (state.panes.length >= 4) return state
  const id = `pane-${Math.max(0, ...state.panes.map(pane => Number(pane.id.slice(5)) || 0)) + 1}`
  const pane: WorkspacePane = { id, tabs: [entity], activeKey: entityKey(entity) }
  return { ...state, direction, panes: [...state.panes, pane], focusedPaneId: id }
}

/** Move an existing tab to another pane, closing the source pane when empty. */
export function moveEntity(state: WorkspaceState, fromPaneId: string, toPaneId: string, key: string): WorkspaceState {
  if (fromPaneId === toPaneId) return state
  const source = state.panes.find(pane => pane.id === fromPaneId)
  const target = state.panes.find(pane => pane.id === toPaneId)
  const entity = source?.tabs.find(tab => entityKey(tab) === key)
  if (source === undefined || target === undefined || entity === undefined) return state
  const targetTabs = target.tabs.some(tab => entityKey(tab) === key) ? target.tabs : [...target.tabs, entity]
  const sourceTabs = source.tabs.filter(tab => entityKey(tab) !== key)
  const panes = state.panes
    .filter(pane => pane.id !== fromPaneId || sourceTabs.length > 0)
    .map((pane): WorkspacePane => {
      if (pane.id === toPaneId) return { ...pane, tabs: targetTabs, activeKey: key }
      if (pane.id !== fromPaneId) return pane
      return { ...pane, tabs: sourceTabs, activeKey: entityKey(sourceTabs[0]!) }
    })
  return {
    ...state,
    direction: panes.length === 1 ? 'single' : state.direction,
    panes,
    focusedPaneId: toPaneId,
  }
}

/** Close one pane while keeping at least one General pane. */
export function closePane(state: WorkspaceState, paneId: string): WorkspaceState {
  if (state.panes.length === 1) return initialWorkspaceState()
  const panes = state.panes.filter(pane => pane.id !== paneId)
  return {
    ...state,
    direction: panes.length === 1 ? 'single' : state.direction,
    panes,
    focusedPaneId: state.focusedPaneId === paneId ? panes[0]!.id : state.focusedPaneId,
  }
}

/** Toggle one Explorer section without affecting domain visibility settings. */
export function toggleSection(state: WorkspaceState, kind: WorkspaceEntityKind): WorkspaceState {
  const collapsed = new Set(state.collapsedSections)
  if (collapsed.has(kind)) collapsed.delete(kind)
  else collapsed.add(kind)
  return { ...state, collapsedSections: [...collapsed] }
}

/** Decode persisted UI state and reject stale or malformed data. */
export function restoreWorkspace(raw: string | null): WorkspaceState | undefined {
  if (raw === null) return undefined
  try {
    const value = JSON.parse(raw) as unknown
    if (typeof value !== 'object' || value === null) return undefined
    const candidate = value as Partial<WorkspaceState>
    if (!Array.isArray(candidate.panes) || candidate.panes.length < 1 || candidate.panes.length > 4) return undefined
    if (candidate.direction !== 'single' && candidate.direction !== 'vertical' && candidate.direction !== 'horizontal') return undefined
    const panes: WorkspacePane[] = []
    for (const rawPane of candidate.panes) {
      if (typeof rawPane !== 'object' || rawPane === null) return undefined
      const pane = rawPane as Partial<WorkspacePane>
      if (typeof pane.id !== 'string' || !Array.isArray(pane.tabs) || typeof pane.activeKey !== 'string') return undefined
      const tabs = pane.tabs.filter(isWorkspaceEntity)
      if (tabs.length === 0 || !tabs.some(tab => entityKey(tab) === pane.activeKey)) return undefined
      panes.push({ id: pane.id, tabs, activeKey: pane.activeKey })
    }
    const focusedPaneId = typeof candidate.focusedPaneId === 'string'
      && panes.some(pane => pane.id === candidate.focusedPaneId)
      ? candidate.focusedPaneId
      : panes[0]!.id
    const collapsedSections = Array.isArray(candidate.collapsedSections)
      ? candidate.collapsedSections.filter(isWorkspaceEntityKind)
      : []
    return {
      direction: panes.length === 1 ? 'single' : candidate.direction === 'single' ? 'vertical' : candidate.direction,
      panes,
      focusedPaneId,
      collapsedSections,
    }
  } catch {
    return undefined
  }
}

function isWorkspaceEntityKind(value: unknown): value is WorkspaceEntityKind {
  return value === 'general' || value === 'agent' || value === 'job'
    || value === 'job-group' || value === 'wait' || value === 'task'
}

function isWorkspaceEntity(value: unknown): value is WorkspaceEntity {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  if (!isWorkspaceEntityKind(candidate.kind)) return false
  switch (candidate.kind) {
    case 'general': return true
    case 'agent': return typeof candidate.sessionId === 'string'
    case 'job': return typeof candidate.sessionId === 'string' && typeof candidate.jobId === 'string'
    case 'job-group': return typeof candidate.groupId === 'string'
    case 'wait': return typeof candidate.waitId === 'string'
    case 'task': return typeof candidate.taskId === 'string'
  }
}
