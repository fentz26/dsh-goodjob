/** GoodJob operations stylesheet, injected once at plugin activation. */
export const STYLES: string = `.gj-root {
  position: relative;
  display: inline-flex;
}

.gj-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--dsw-border);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-text);
  padding: 2px 10px;
  font-size: 12px;
  cursor: pointer;
}

.gj-trigger:hover {
  background: var(--dsw-hover);
}

.gj-liveCount {
  min-width: 16px;
  border-radius: 999px;
  background: var(--dsw-accent);
  color: var(--dsw-accent-contrast, #fff);
  text-align: center;
  font-size: 11px;
  line-height: 16px;
}

.gj-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  width: 380px;
  max-height: 70vh;
  overflow: auto;
  border: 1px solid var(--dsw-border);
  border-radius: 10px;
  background: var(--dsw-panel);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  padding: 12px;
}

.gj-heading {
  margin: 4px 0 6px;
  font-size: 11px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--dsw-text-muted);
}

.gj-empty {
  color: var(--dsw-text-muted);
  font-size: 12px;
  margin: 2px 0;
}

/* Agents */

.gj-agents,
.gj-jobs,
.gj-waits,
.gj-groups,
.gj-groupMembers,
.gj-teams,
.gj-teamTasks,
.gj-mailbox {
  list-style: none;
  margin: 0;
  padding: 0;
}

.gj-agentRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.gj-agentDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dsw-border);
}

.gj-agentRunning {
  background: var(--dsw-accent);
}

.gj-agentLabel {
  font-size: 12px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gj-agentMode {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

.gj-agentDepth {
  color: var(--dsw-text-muted);
  font-size: 10px;
}

.gj-agentActions {
  margin-left: auto;
  display: inline-flex;
  gap: 4px;
}

.gj-action {
  border: 1px solid var(--dsw-border);
  background: transparent;
  color: var(--dsw-text);
  border-radius: 6px;
  font-size: 11px;
  padding: 1px 8px;
  cursor: pointer;
}

.gj-action:disabled {
  opacity: .5;
  cursor: default;
}

.gj-primary {
  background: var(--dsw-accent);
  border-color: var(--dsw-accent);
  color: var(--dsw-accent-contrast, #fff);
}

.gj-composer {
  flex-basis: 100%;
  margin-top: 4px;
}

.gj-composerInput {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid var(--dsw-border);
  border-radius: 6px;
  background: var(--dsw-input-bg, transparent);
  color: var(--dsw-text);
  font-size: 12px;
  padding: 4px 6px;
}

.gj-composerRow {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

/* Jobs */

.gj-jobRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.gj-jobStatus {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

.gj-jobLive {
  color: var(--dsw-accent);
}

.gj-jobLabel {
  font-size: 12px;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gj-jobDuration {
  font-size: 11px;
  color: var(--dsw-text-muted);
  font-variant-numeric: tabular-nums;
}

.gj-output {
  flex-basis: 100%;
  max-height: 180px;
  overflow: auto;
  background: var(--dsw-code-bg, rgb(127 127 127 / 12%));
  border-radius: 6px;
  padding: 6px;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Groups and Teams */

.gj-groupRow,
.gj-teamRow,
.gj-teamTask,
.gj-groupMember {
  padding: 3px 0;
}

.gj-groupRow summary,
.gj-groupMember,
.gj-teamRow,
.gj-teamTask {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.gj-groupLabel {
  font-size: 12px;
}

.gj-groupCount {
  margin-left: 6px;
  color: var(--dsw-text-muted);
  font-size: 10px;
}

.gj-groupMembers,
.gj-teamTasks,
.gj-mailbox {
  margin-left: 14px;
}

.gj-mailbox {
  color: var(--dsw-text-muted);
  font-size: 11px;
}

.gj-error {
  color: var(--dsw-danger, #c44);
  font-size: 11px;
}

/* Waits */

.gj-waitRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.gj-waitStatus {
  font-size: 10px;
  border-radius: 999px;
  border: 1px solid var(--dsw-border);
  padding: 0 6px;
}

.gj-ready {
  color: var(--dsw-ok, #3a9);
}

.gj-dispatched {
  color: var(--dsw-ok, #3a9);
}

.gj-cancelled {
  color: var(--dsw-text-muted);
  text-decoration: line-through;
}

.gj-waitMode {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

.gj-leaves {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0;
  padding: 0;
}

.gj-leaf,
.gj-leafDone {
  font-size: 11px;
  display: inline-flex;
  gap: 2px;
}

.gj-leafDone {
  color: var(--dsw-ok, #3a9);
}

.gj-leafMark {
  font-size: 10px;
}

.gj-winner {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

/* Settings card */

.gj-card {
  border: 1px solid var(--dsw-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gj-cardRow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

/* Operations workspace */

.gj-workspace {
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(170px, 230px) minmax(0, 1fr);
  color: var(--dsw-text);
  background: var(--dsw-panel);
  border-top: 1px solid var(--dsw-border);
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: calc(var(--dsh-composer-height, 152px) + 8px);
}

.gj-explorer {
  min-width: 0;
  border-right: 1px solid var(--dsw-border);
  background: color-mix(in srgb, var(--dsw-panel) 94%, var(--dsw-text) 6%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gj-explorerHeader,
.gj-paneHeader,
.gj-editorHeader,
.gj-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gj-explorerHeader {
  padding: 9px 10px 6px;
  justify-content: space-between;
}

.gj-explorerTitle {
  margin: 0;
  font-size: 11px;
  letter-spacing: .07em;
  text-transform: uppercase;
}

.gj-filter {
  box-sizing: border-box;
  width: calc(100% - 16px);
  margin: 0 8px 6px;
  border: 1px solid var(--dsw-border);
  border-radius: 5px;
  background: var(--dsw-input-bg, transparent);
  color: var(--dsw-text);
  padding: 5px 7px;
  font-size: 12px;
}

.gj-explorerScroll {
  min-height: 0;
  overflow: auto;
  padding-bottom: 12px;
}

.gj-explorerSection {
  border-top: 1px solid color-mix(in srgb, var(--dsw-border) 65%, transparent);
}

.gj-explorerSection > summary {
  cursor: pointer;
  list-style: none;
  padding: 6px 9px;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--dsw-text-muted);
}

.gj-explorerSection > summary::-webkit-details-marker { display: none; }

.gj-tree {
  list-style: none;
  margin: 0;
  padding: 0 5px 5px;
}

.gj-treeButton {
  width: 100%;
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--dsw-text);
  padding: 4px 5px;
  text-align: left;
  font-size: 12px;
  cursor: pointer;
}

.gj-treeButton:hover,
.gj-treeButton[aria-current="true"] {
  background: var(--dsw-hover);
}

.gj-treeLabel {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gj-treeState,
.gj-meta,
.gj-quiet {
  color: var(--dsw-text-muted);
  font-size: 10px;
}

.gj-stateDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dsw-border);
}

.gj-stateDot[data-state="running"],
.gj-stateDot[data-state="in_progress"],
.gj-stateDot[data-state="pending"] { background: var(--dsw-accent); }
.gj-stateDot[data-state="completed"],
.gj-stateDot[data-state="ready"],
.gj-stateDot[data-state="dispatched"] { background: var(--dsw-ok, #3a9); }
.gj-stateDot[data-state="failed"],
.gj-stateDot[data-state="blocked"] { background: var(--dsw-danger, #c44); }

.gj-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.gj-workspaceToolbar {
  flex: none;
  min-height: 34px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--dsw-border);
  justify-content: space-between;
}

.gj-panes {
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: grid;
  overflow: hidden;
}

.gj-panes[data-direction="single"] { grid-template-columns: minmax(0, 1fr); }
.gj-panes[data-direction="vertical"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gj-panes[data-direction="horizontal"] { grid-template-rows: repeat(2, minmax(0, 1fr)); }
.gj-panes[data-count="3"],
.gj-panes[data-count="4"] {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.gj-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
  border-right-color: var(--dsw-border);
  border-bottom-color: var(--dsw-border);
}

.gj-pane[data-focused="true"] { border-top-color: var(--dsw-accent); }

.gj-tabs {
  flex: 1;
  min-width: 0;
  display: flex;
  overflow-x: auto;
  scrollbar-width: thin;
}

.gj-tab {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 190px;
  border: 0;
  border-right: 1px solid var(--dsw-border);
  border-bottom: 1px solid var(--dsw-border);
  background: color-mix(in srgb, var(--dsw-panel) 92%, var(--dsw-text) 8%);
  color: var(--dsw-text-muted);
  padding: 6px 8px;
  font-size: 11px;
  cursor: pointer;
}

.gj-tab[aria-selected="true"] {
  background: var(--dsw-panel);
  color: var(--dsw-text);
  border-bottom-color: transparent;
}

.gj-tabLabel { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gj-tabClose { opacity: .65; }

.gj-paneActions { flex: none; display: flex; gap: 3px; padding: 3px; }

.gj-iconButton {
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--dsw-text-muted);
  padding: 3px 6px;
  font-size: 11px;
  cursor: pointer;
}

.gj-iconButton:hover { background: var(--dsw-hover); color: var(--dsw-text); }
.gj-iconButton:disabled { opacity: .35; cursor: default; }

.gj-editorStack,
.gj-editor {
  min-width: 0;
  min-height: 0;
  flex: 1;
}

.gj-editorStack { position: relative; }
.gj-editor[hidden] { display: none; }
.gj-editor { height: 100%; overflow: auto; padding: 14px 16px 24px; box-sizing: border-box; }

.gj-sessionViewHost {
  min-width: 0;
  min-height: 360px;
  height: calc(100% - 74px);
  overflow: hidden;
  border: 1px solid var(--dsw-border);
  border-radius: 6px;
}
.gj-sessionViewUnavailable { padding: 16px; }

.gj-editorHeader {
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--dsw-border);
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.gj-title { margin: 0; font-size: 18px; font-weight: 620; }
.gj-subtitle { margin: 3px 0 0; color: var(--dsw-text-muted); font-size: 11px; }

.gj-badge {
  display: inline-flex;
  border: 1px solid var(--dsw-border);
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 10px;
  white-space: nowrap;
}

.gj-section { margin-top: 16px; }
.gj-sectionTitle { margin: 0 0 7px; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: var(--dsw-text-muted); }

.gj-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  border: 1px solid var(--dsw-border);
  border-radius: 7px;
  overflow: hidden;
}

.gj-metric { padding: 10px 12px; border-right: 1px solid var(--dsw-border); }
.gj-metric:last-child { border-right: 0; }
.gj-metricValue { display: block; font-size: 18px; font-variant-numeric: tabular-nums; }
.gj-metricLabel { color: var(--dsw-text-muted); font-size: 10px; }

.gj-list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--dsw-border); border-radius: 7px; overflow: hidden; }
.gj-listRow { display: flex; align-items: center; gap: 8px; min-height: 30px; padding: 5px 8px; border-bottom: 1px solid var(--dsw-border); font-size: 12px; }
.gj-listRow:last-child { border-bottom: 0; }
.gj-listRow > button { min-width: 0; }
.gj-rowMain { flex: 1; min-width: 0; }

.gj-linkButton { border: 0; background: transparent; color: var(--dsw-text); padding: 0; text-align: left; cursor: pointer; }
.gj-linkButton:hover { color: var(--dsw-accent); text-decoration: underline; }

.gj-attention { color: var(--dsw-danger, #c44); }
.gj-warning { color: var(--dsw-warning, #b77a16); }

.gj-graph { list-style: none; margin: 0; padding: 0 0 0 4px; }
.gj-graph ul { list-style: none; margin: 4px 0 4px 13px; padding-left: 12px; border-left: 1px solid var(--dsw-border); }
.gj-graph li { margin: 4px 0; font-size: 12px; }

.gj-logToolbar { display: grid; grid-template-columns: minmax(120px, 280px) auto 1fr; gap: 6px; margin-bottom: 8px; }
.gj-log {
  min-height: 180px;
  max-height: min(62vh, 720px);
  overflow: auto;
  margin: 0;
  padding: 10px;
  border: 1px solid var(--dsw-border);
  border-radius: 6px;
  background: var(--dsw-code-bg, rgb(127 127 127 / 12%));
  font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.gj-fields { display: grid; grid-template-columns: minmax(90px, max-content) 1fr; gap: 5px 12px; font-size: 12px; }
.gj-fields dt { color: var(--dsw-text-muted); }
.gj-fields dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }

.gj-mailMessage { align-items: flex-start; }
.gj-mailText { white-space: pre-wrap; }

.gj-mobileExplorerToggle { display: none; }

@media (max-width: 820px) {
  .gj-workspace { grid-template-columns: minmax(0, 1fr); }
  .gj-explorer { position: absolute; z-index: 12; inset: 0 auto 0 0; width: min(82vw, 280px); box-shadow: 8px 0 24px rgb(0 0 0 / 20%); }
  .gj-workspace[data-explorer-open="false"] .gj-explorer { display: none; }
  .gj-mobileExplorerToggle { display: inline-flex; }
  .gj-panes,
  .gj-panes[data-direction="vertical"],
  .gj-panes[data-direction="horizontal"],
  .gj-panes[data-count="3"],
  .gj-panes[data-count="4"] { display: block; }
  .gj-pane { display: none; height: 100%; }
  .gj-pane[data-focused="true"] { display: flex; }
  .gj-sessionViewHost { min-height: 480px; height: auto; }
  .gj-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gj-metric:nth-child(2) { border-right: 0; }
  .gj-metric:nth-child(-n+2) { border-bottom: 1px solid var(--dsw-border); }
}
`

/** Class-name map mirroring the stylesheet's selectors. */
export const css: Record<string, string> = {
  'action': 'gj-action',
  'agentActions': 'gj-agentActions',
  'agentDot': 'gj-agentDot',
  'agentDepth': 'gj-agentDepth',
  'agentLabel': 'gj-agentLabel',
  'agentMode': 'gj-agentMode',
  'agentRow': 'gj-agentRow',
  'agentRunning': 'gj-agentRunning',
  'agents': 'gj-agents',
  'cancelled': 'gj-cancelled',
  'card': 'gj-card',
  'cardRow': 'gj-cardRow',
  'composer': 'gj-composer',
  'composerInput': 'gj-composerInput',
  'composerRow': 'gj-composerRow',
  'dispatched': 'gj-dispatched',
  'empty': 'gj-empty',
  'error': 'gj-error',
  'groupCount': 'gj-groupCount',
  'groupLabel': 'gj-groupLabel',
  'groupMember': 'gj-groupMember',
  'groupMembers': 'gj-groupMembers',
  'groupRow': 'gj-groupRow',
  'groups': 'gj-groups',
  'heading': 'gj-heading',
  'jobDuration': 'gj-jobDuration',
  'jobLabel': 'gj-jobLabel',
  'jobLive': 'gj-jobLive',
  'jobRow': 'gj-jobRow',
  'jobStatus': 'gj-jobStatus',
  'jobs': 'gj-jobs',
  'leaf': 'gj-leaf',
  'leafDone': 'gj-leafDone',
  'leafMark': 'gj-leafMark',
  'leaves': 'gj-leaves',
  'liveCount': 'gj-liveCount',
  'menu': 'gj-menu',
  'mailbox': 'gj-mailbox',
  'output': 'gj-output',
  'primary': 'gj-primary',
  'ready': 'gj-ready',
  'root': 'gj-root',
  'trigger': 'gj-trigger',
  'teamRow': 'gj-teamRow',
  'teamTask': 'gj-teamTask',
  'teamTasks': 'gj-teamTasks',
  'teams': 'gj-teams',
  'waitMode': 'gj-waitMode',
  'waitRow': 'gj-waitRow',
  'waitStatus': 'gj-waitStatus',
  'waits': 'gj-waits',
  'winner': 'gj-winner',
}
