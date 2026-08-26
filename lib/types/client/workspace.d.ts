/**
 * Presentation-only GoodJob workspace state.
 *
 * Entity identities contain the authoritative DSH ids needed to resolve a
 * fresh projection. Tabs and panes never retain Job, Agent, Wait, or Team
 * state.
 * @module dsh-goodjob/client/workspace
 */
/** Entity kinds that can occupy a GoodJob editor tab. */
export type WorkspaceEntityKind = 'general' | 'agent' | 'job' | 'job-group' | 'wait' | 'task' | 'goal' | 'workflow' | 'schedule' | 'session-view';
/** Stable identity of one editor subject. */
export type WorkspaceEntity = {
    kind: 'general';
} | {
    kind: 'agent';
    sessionId: string;
} | {
    kind: 'job';
    sessionId: string;
    jobId: string;
} | {
    kind: 'job-group';
    groupId: string;
} | {
    kind: 'wait';
    waitId: string;
} | {
    kind: 'task';
    taskId: string;
} | {
    kind: 'goal';
} | {
    kind: 'workflow';
    workflowId: string;
} | {
    kind: 'schedule';
    scheduleId: string;
} | {
    kind: 'session-view';
    sessionId: string;
    viewId: string;
};
/** Stable client identity for deduplication and persistence. */
export declare function entityKey(entity: WorkspaceEntity): string;
/** One editor pane; tabs are unique inside the pane but may appear in another pane. */
export interface WorkspacePane {
    id: string;
    tabs: readonly WorkspaceEntity[];
    activeKey: string;
}
/** Persistable GoodJob presentation state. */
export interface WorkspaceState {
    direction: 'single' | 'vertical' | 'horizontal';
    panes: readonly WorkspacePane[];
    focusedPaneId: string;
    collapsedSections: readonly WorkspaceEntityKind[];
}
/** Fresh workspace with General selected. */
export declare function initialWorkspaceState(): WorkspaceState;
/** Return the pane that currently owns keyboard and ordinary-open placement. */
export declare function focusedPane(state: WorkspaceState): WorkspacePane;
/** Open or focus an entity without duplicating it across panes. */
export declare function openEntity(state: WorkspaceState, entity: WorkspaceEntity): WorkspaceState;
/** Focus one existing tab and its pane. */
export declare function activateEntity(state: WorkspaceState, paneId: string, key: string): WorkspaceState;
/** Close one tab, retaining General when it is the pane's last tab. */
export declare function closeEntity(state: WorkspaceState, paneId: string, key: string): WorkspaceState;
/** Open an entity in a new pane, allowing the same entity in two panes. */
export declare function openToSide(state: WorkspaceState, entity: WorkspaceEntity, direction: 'vertical' | 'horizontal'): WorkspaceState;
/** Move an existing tab to another pane, closing the source pane when empty. */
export declare function moveEntity(state: WorkspaceState, fromPaneId: string, toPaneId: string, key: string): WorkspaceState;
/** Close one pane while keeping at least one General pane. */
export declare function closePane(state: WorkspaceState, paneId: string): WorkspaceState;
/** Toggle one Explorer section without affecting domain visibility settings. */
export declare function toggleSection(state: WorkspaceState, kind: WorkspaceEntityKind): WorkspaceState;
/** Decode persisted UI state and reject stale or malformed data. */
export declare function restoreWorkspace(raw: string | null): WorkspaceState | undefined;
