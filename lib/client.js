window.__ModuleLoader__.load({ id: "dsh-goodjob", factory: (require) => { const module = { exports: {} }; const exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let _deepseek_ai_dsh_client_ui_slots = require("@deepseek-ai/dsh-client-ui-slots");
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/config-types.ts
/** Defaults for absent keys, mirrored by the client card. */
const DEFAULTS = {
	showJobs: true,
	showWaits: true,
	showSubagents: true,
	showGroups: true,
	autoExpandActiveGroups: true,
	showTeams: true,
	showTeamMailbox: true,
	showTeamTasks: true,
	autoFollowOutput: true,
	restoreWorkspace: true,
	showActivityFeed: true,
	showGraph: true,
	showCompletedJobs: true,
	showCompletedTasks: false,
	maxRenderedOutputChars: 2e5,
	outputObserveIntervalMs: 1e3
};
//#endregion
//#region src/client/styles.ts
/** GoodJob operations stylesheet, injected once at plugin activation. */
const STYLES = `.gj-root {
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
`;
/** Class-name map mirroring the stylesheet's selectors. */
const css = {
	"action": "gj-action",
	"agentActions": "gj-agentActions",
	"agentDot": "gj-agentDot",
	"agentDepth": "gj-agentDepth",
	"agentLabel": "gj-agentLabel",
	"agentMode": "gj-agentMode",
	"agentRow": "gj-agentRow",
	"agentRunning": "gj-agentRunning",
	"agents": "gj-agents",
	"cancelled": "gj-cancelled",
	"card": "gj-card",
	"cardRow": "gj-cardRow",
	"composer": "gj-composer",
	"composerInput": "gj-composerInput",
	"composerRow": "gj-composerRow",
	"dispatched": "gj-dispatched",
	"empty": "gj-empty",
	"error": "gj-error",
	"groupCount": "gj-groupCount",
	"groupLabel": "gj-groupLabel",
	"groupMember": "gj-groupMember",
	"groupMembers": "gj-groupMembers",
	"groupRow": "gj-groupRow",
	"groups": "gj-groups",
	"heading": "gj-heading",
	"jobDuration": "gj-jobDuration",
	"jobLabel": "gj-jobLabel",
	"jobLive": "gj-jobLive",
	"jobRow": "gj-jobRow",
	"jobStatus": "gj-jobStatus",
	"jobs": "gj-jobs",
	"leaf": "gj-leaf",
	"leafDone": "gj-leafDone",
	"leafMark": "gj-leafMark",
	"leaves": "gj-leaves",
	"liveCount": "gj-liveCount",
	"menu": "gj-menu",
	"mailbox": "gj-mailbox",
	"output": "gj-output",
	"primary": "gj-primary",
	"ready": "gj-ready",
	"root": "gj-root",
	"trigger": "gj-trigger",
	"teamRow": "gj-teamRow",
	"teamTask": "gj-teamTask",
	"teamTasks": "gj-teamTasks",
	"teams": "gj-teams",
	"waitMode": "gj-waitMode",
	"waitRow": "gj-waitRow",
	"waitStatus": "gj-waitStatus",
	"waits": "gj-waits",
	"winner": "gj-winner"
};
//#endregion
//#region src/client/SettingsCard.tsx
/**
* The GoodJob settings card: the visibility toggles under
* Settings → Plugins → GoodJob, keyed by the plugin's `goodjob` namespace.
* The card stages edits locally, sends one revision-checked patch through the
* existing settings API, and renders nothing while the namespace is absent.
* Repository and version metadata live in the Plugin Inventory surface
* instead of this form.
* @module dsh-goodjob/client/SettingsCard
*/
/** The boolean fields this card owns with host-mirrored defaults. */
const FIELDS = [
	["showJobs", "Jobs"],
	["showSubagents", "Agents"],
	["showWaits", "Waits"],
	["showGroups", "Job Groups"],
	["autoExpandActiveGroups", "Expand active groups"],
	["showTeams", "Agent Teams"],
	["showTeamMailbox", "Team mailbox"],
	["showTeamTasks", "Team tasks"],
	["autoFollowOutput", "Auto-follow job output"],
	["restoreWorkspace", "Restore open tabs and split layout"],
	["showActivityFeed", "Activity feed"],
	["showGraph", "Relationship graph"],
	["showCompletedJobs", "Completed Jobs in Explorer"],
	["showCompletedTasks", "Completed tasks in Explorer"]
];
/**
* Render the GoodJob configuration card.
* @param props - API access.
* @returns the card body, or null before the namespace answers.
*/
function GoodJobSettingsCard({ api }) {
	const [current, setCurrent] = (0, react.useState)();
	const [writable, setWritable] = (0, react.useState)(false);
	const [revision, setRevision] = (0, react.useState)();
	const [dirty, setDirty] = (0, react.useState)({});
	(0, react.useEffect)(() => {
		let cancelled = false;
		api.settings.describe({}).then((response) => {
			if (cancelled || !response.result.ok) return;
			const described = response.result.value;
			setWritable(described.writable);
			const section = described.namespaces.find((ns) => ns.ns === "goodjob");
			if (section !== void 0) {
				setRevision(section.revision);
				const value = section.value;
				setCurrent({
					showJobs: value?.showJobs ?? true,
					showWaits: value?.showWaits ?? true,
					showSubagents: value?.showSubagents ?? true,
					showGroups: value?.showGroups ?? true,
					autoExpandActiveGroups: value?.autoExpandActiveGroups ?? true,
					showTeams: value?.showTeams ?? true,
					showTeamMailbox: value?.showTeamMailbox ?? true,
					showTeamTasks: value?.showTeamTasks ?? true,
					autoFollowOutput: value?.autoFollowOutput ?? true,
					restoreWorkspace: value?.restoreWorkspace ?? true,
					showActivityFeed: value?.showActivityFeed ?? true,
					showGraph: value?.showGraph ?? true,
					showCompletedJobs: value?.showCompletedJobs ?? true,
					showCompletedTasks: value?.showCompletedTasks ?? false,
					maxRenderedOutputChars: value?.maxRenderedOutputChars ?? 2e5,
					outputObserveIntervalMs: value?.outputObserveIntervalMs ?? 1e3
				});
			}
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [api]);
	if (current === void 0) return null;
	const save = () => {
		api.settings.update({
			ns: "goodjob",
			patch: dirty,
			expectedRevision: revision
		});
		setCurrent({
			...current,
			...dirty
		});
		setDirty({});
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: css.card,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: css.heading,
				children: "GoodJob"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: css.empty,
				children: "Background jobs, waits, and agent operations"
			}),
			FIELDS.map(([field, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: css.cardRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: (dirty[field] ?? current[field]) === true,
					disabled: !writable,
					onChange: (event) => {
						setDirty((previous) => ({
							...previous,
							[field]: event.target.checked
						}));
					}
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
			}, field)),
			Object.keys(dirty).length > 0 && writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: `${css.action} ${css.primary}`,
				onClick: save,
				children: "Save"
			}) : null
		]
	});
}
//#endregion
//#region src/client/locales.ts
/** Locale namespace owned by the operations view. */
const NS = "goodjob";
/** Chinese product copy. */
const zh = {
	"title": "GoodJob 运维面板",
	"view.workspace": "GoodJob",
	"section.agents": "子代理",
	"section.jobs": "后台任务",
	"section.waits": "等待",
	"agents.empty": "此会话没有子代理。",
	"agents.currentTask": "当前任务",
	"agents.lastActivity": "最近活动",
	"agents.elapsed": "已用时",
	"agents.open": "打开",
	"agents.message": "消息",
	"agents.interrupt": "打断",
	"agents.messagePlaceholder": "向该代理追加一条提示…",
	"agents.send": "发送",
	"agents.interruptConfirm": "打断当前轮次？会话保持可继续。",
	"jobs.empty": "没有后台任务。",
	"jobs.owner": "所有者",
	"jobs.logs": "日志",
	"waits.empty": "没有等待中的条件。",
	"waits.mode.any": "任一",
	"waits.mode.all": "全部",
	"waits.status.pending": "等待中",
	"waits.status.ready": "就绪",
	"waits.status.dispatched": "已唤醒",
	"waits.status.cancelled": "已取消",
	"status.running": "运行中",
	"status.idle": "空闲",
	"status.inactive": "不活跃",
	"common.close": "关闭"
};
/** English copy. */
const en = {
	"title": "GoodJob Operations",
	"view.workspace": "GoodJob",
	"section.agents": "Subagents",
	"section.jobs": "Jobs",
	"section.waits": "Waits",
	"agents.empty": "No subagents in this session.",
	"agents.currentTask": "task",
	"agents.lastActivity": "last activity",
	"agents.elapsed": "elapsed",
	"agents.open": "Open",
	"agents.message": "Message",
	"agents.interrupt": "Interrupt",
	"agents.messagePlaceholder": "Send an additional prompt to this agent…",
	"agents.send": "Send",
	"agents.interruptConfirm": "Interrupt the current turn? The session stays continuable.",
	"jobs.empty": "No background jobs.",
	"jobs.owner": "owner",
	"jobs.logs": "Logs",
	"waits.empty": "Nothing being waited on.",
	"waits.mode.any": "any",
	"waits.mode.all": "all",
	"waits.status.pending": "waiting",
	"waits.status.ready": "ready",
	"waits.status.dispatched": "resumed",
	"waits.status.cancelled": "cancelled",
	"status.running": "running",
	"status.idle": "idle",
	"status.inactive": "inactive",
	"common.close": "Close"
};
//#endregion
//#region src/client/AgentsList.tsx
/**
* Agents section: one row per descendant subagent of the current session.
*
* Data comes from the existing `subagentsByParent` catalog mirror; message
* and interrupt go through the existing subagent RPCs, so no duplicate
* conversation is created, delivery keeps the host's FIFO queueing, and
* interruption only ends the current turn.
* @module dsh-goodjob/client/AgentsList
*/
/** Narrow a raw catalog entry to the renderable child shape; diagnostics rows are skipped. */
function toAgentRow(entry, fallbackParentId = "") {
	if (typeof entry !== "object" || entry === null) return void 0;
	const candidate = entry;
	if (candidate.kind !== "child") return void 0;
	if (candidate.mode !== "one-shot" && candidate.mode !== "continuable") return void 0;
	if (candidate.activity !== "running" && candidate.activity !== "inactive") return void 0;
	return {
		id: String(candidate.id),
		parentId: typeof candidate.parentId === "string" ? candidate.parentId : fallbackParentId,
		depth: typeof candidate.depth === "number" ? candidate.depth : 1,
		label: typeof candidate.label === "string" ? candidate.label : void 0,
		mode: candidate.mode,
		activity: candidate.activity,
		model: typeof candidate.model === "string" ? candidate.model : void 0,
		relatedJobIds: Array.isArray(candidate.relatedJobIds) ? candidate.relatedJobIds.filter((id) => typeof id === "string") : []
	};
}
//#endregion
//#region src/client/workspace.ts
/** Stable client identity for deduplication and persistence. */
function entityKey(entity) {
	switch (entity.kind) {
		case "general": return "general";
		case "agent": return `agent:${entity.sessionId}`;
		case "job": return `job:${entity.sessionId}:${entity.jobId}`;
		case "job-group": return `group:${entity.groupId}`;
		case "wait": return `wait:${entity.waitId}`;
		case "task": return `task:${entity.taskId}`;
		case "session-view": return `view:${entity.sessionId}:${entity.viewId}`;
	}
}
/** Fresh workspace with General selected. */
function initialWorkspaceState() {
	return {
		direction: "single",
		panes: [{
			id: "pane-1",
			tabs: [{ kind: "general" }],
			activeKey: "general"
		}],
		focusedPaneId: "pane-1",
		collapsedSections: []
	};
}
/** Return the pane that currently owns keyboard and ordinary-open placement. */
function focusedPane(state) {
	return state.panes.find((pane) => pane.id === state.focusedPaneId) ?? state.panes[0] ?? initialWorkspaceState().panes[0];
}
/** Open or focus an entity without duplicating it across panes. */
function openEntity(state, entity) {
	const key = entityKey(entity);
	const existing = state.panes.find((pane) => pane.tabs.some((tab) => entityKey(tab) === key));
	if (existing !== void 0) return activateEntity(state, existing.id, key);
	const target = focusedPane(state);
	return {
		...state,
		panes: state.panes.map((pane) => pane.id === target.id ? {
			...pane,
			tabs: [...pane.tabs, entity],
			activeKey: key
		} : pane)
	};
}
/** Focus one existing tab and its pane. */
function activateEntity(state, paneId, key) {
	const pane = state.panes.find((candidate) => candidate.id === paneId);
	if (pane === void 0 || !pane.tabs.some((tab) => entityKey(tab) === key)) return state;
	return {
		...state,
		focusedPaneId: paneId,
		panes: state.panes.map((candidate) => candidate.id === paneId ? {
			...candidate,
			activeKey: key
		} : candidate)
	};
}
/** Close one tab, retaining General when it is the pane's last tab. */
function closeEntity(state, paneId, key) {
	const pane = state.panes.find((candidate) => candidate.id === paneId);
	if (pane === void 0) return state;
	const index = pane.tabs.findIndex((tab) => entityKey(tab) === key);
	if (index === -1) return state;
	let tabs = pane.tabs.filter((tab) => entityKey(tab) !== key);
	if (tabs.length === 0) tabs = [{ kind: "general" }];
	const nextActive = pane.activeKey === key ? entityKey(tabs[Math.min(index, tabs.length - 1)]) : pane.activeKey;
	return {
		...state,
		panes: state.panes.map((candidate) => candidate.id === paneId ? {
			...candidate,
			tabs,
			activeKey: nextActive
		} : candidate)
	};
}
/** Open an entity in a new pane, allowing the same entity in two panes. */
function openToSide(state, entity, direction) {
	if (state.panes.length >= 4) return state;
	const id = `pane-${Math.max(0, ...state.panes.map((pane) => Number(pane.id.slice(5)) || 0)) + 1}`;
	const pane = {
		id,
		tabs: [entity],
		activeKey: entityKey(entity)
	};
	return {
		...state,
		direction,
		panes: [...state.panes, pane],
		focusedPaneId: id
	};
}
/** Move an existing tab to another pane, closing the source pane when empty. */
function moveEntity(state, fromPaneId, toPaneId, key) {
	if (fromPaneId === toPaneId) return state;
	const source = state.panes.find((pane) => pane.id === fromPaneId);
	const target = state.panes.find((pane) => pane.id === toPaneId);
	const entity = source?.tabs.find((tab) => entityKey(tab) === key);
	if (source === void 0 || target === void 0 || entity === void 0) return state;
	const targetTabs = target.tabs.some((tab) => entityKey(tab) === key) ? target.tabs : [...target.tabs, entity];
	const sourceTabs = source.tabs.filter((tab) => entityKey(tab) !== key);
	const panes = state.panes.filter((pane) => pane.id !== fromPaneId || sourceTabs.length > 0).map((pane) => {
		if (pane.id === toPaneId) return {
			...pane,
			tabs: targetTabs,
			activeKey: key
		};
		if (pane.id !== fromPaneId) return pane;
		return {
			...pane,
			tabs: sourceTabs,
			activeKey: entityKey(sourceTabs[0])
		};
	});
	return {
		...state,
		direction: panes.length === 1 ? "single" : state.direction,
		panes,
		focusedPaneId: toPaneId
	};
}
/** Close one pane while keeping at least one General pane. */
function closePane(state, paneId) {
	if (state.panes.length === 1) return initialWorkspaceState();
	const panes = state.panes.filter((pane) => pane.id !== paneId);
	return {
		...state,
		direction: panes.length === 1 ? "single" : state.direction,
		panes,
		focusedPaneId: state.focusedPaneId === paneId ? panes[0].id : state.focusedPaneId
	};
}
/** Toggle one Explorer section without affecting domain visibility settings. */
function toggleSection(state, kind) {
	const collapsed = new Set(state.collapsedSections);
	if (collapsed.has(kind)) collapsed.delete(kind);
	else collapsed.add(kind);
	return {
		...state,
		collapsedSections: [...collapsed]
	};
}
/** Decode persisted UI state and reject stale or malformed data. */
function restoreWorkspace(raw) {
	if (raw === null) return void 0;
	try {
		const value = JSON.parse(raw);
		if (typeof value !== "object" || value === null) return void 0;
		const candidate = value;
		if (!Array.isArray(candidate.panes) || candidate.panes.length < 1 || candidate.panes.length > 4) return void 0;
		if (candidate.direction !== "single" && candidate.direction !== "vertical" && candidate.direction !== "horizontal") return void 0;
		const panes = [];
		for (const rawPane of candidate.panes) {
			if (typeof rawPane !== "object" || rawPane === null) return void 0;
			const pane = rawPane;
			if (typeof pane.id !== "string" || !Array.isArray(pane.tabs) || typeof pane.activeKey !== "string") return void 0;
			const tabs = pane.tabs.filter(isWorkspaceEntity);
			if (tabs.length === 0 || !tabs.some((tab) => entityKey(tab) === pane.activeKey)) return void 0;
			panes.push({
				id: pane.id,
				tabs,
				activeKey: pane.activeKey
			});
		}
		const focusedPaneId = typeof candidate.focusedPaneId === "string" && panes.some((pane) => pane.id === candidate.focusedPaneId) ? candidate.focusedPaneId : panes[0].id;
		const collapsedSections = Array.isArray(candidate.collapsedSections) ? candidate.collapsedSections.filter(isWorkspaceEntityKind) : [];
		return {
			direction: panes.length === 1 ? "single" : candidate.direction === "single" ? "vertical" : candidate.direction,
			panes,
			focusedPaneId,
			collapsedSections
		};
	} catch {
		return;
	}
}
function isWorkspaceEntityKind(value) {
	return value === "general" || value === "agent" || value === "job" || value === "job-group" || value === "wait" || value === "task" || value === "session-view";
}
function isWorkspaceEntity(value) {
	if (typeof value !== "object" || value === null) return false;
	const candidate = value;
	if (!isWorkspaceEntityKind(candidate.kind)) return false;
	switch (candidate.kind) {
		case "general": return true;
		case "agent": return typeof candidate.sessionId === "string";
		case "job": return typeof candidate.sessionId === "string" && typeof candidate.jobId === "string";
		case "job-group": return typeof candidate.groupId === "string";
		case "wait": return typeof candidate.waitId === "string";
		case "task": return typeof candidate.taskId === "string";
		case "session-view": return typeof candidate.sessionId === "string" && typeof candidate.viewId === "string";
	}
}
//#endregion
//#region src/client/WorkspaceView.tsx
/** Native DSH conversation view implementing the GoodJob operations workspace. */
const NO_JOBS = {};
const NO_CATALOG = {};
function isLive(job) {
	return job.status === "running" || job.status === "stopping";
}
/** Native view wrapper: subscribe to DSH mirrors and read optional runtime adapters once. */
function WorkspaceView(props) {
	const { sessionId, useSessions, useProjection, api, rpc, config, refreshSubagents, openChild, sessionViews, SessionSlotHost } = props;
	(0, react.useSyncExternalStore)(sessionViews.subscribe, sessionViews.version);
	const useSessionsTyped = useSessions;
	const jobsBySession = useSessionsTyped((state) => state.jobsBySession) ?? NO_JOBS;
	const catalogs = useSessionsTyped((state) => state.subagentsByParent) ?? NO_CATALOG;
	const waits = useProjection("goodjob/waits")?.waits ?? [];
	const groups = (useProjection("goodjob/groups")?.groups ?? []).filter((group) => group.ownerSessionId === sessionId);
	const teamProjection = useProjection("goodjob/teams")?.teams?.find((team) => team.teamId === sessionId);
	const [operations, setOperations] = (0, react.useState)();
	const refresh = (0, react.useCallback)(() => {
		refreshSubagents(sessionId);
		rpc.call("/goodjob", "operations.describe", { sessionId: String(sessionId) }).then((result) => {
			if (result.ok) setOperations(result.value);
		}).catch(() => {});
	}, [
		refreshSubagents,
		rpc,
		sessionId
	]);
	(0, react.useEffect)(() => {
		refresh();
	}, [refresh]);
	const fallbackAgents = (0, react.useMemo)(() => (catalogs[String(sessionId)]?.entries ?? []).map((entry) => toAgentRow(entry, String(sessionId))).filter((row) => row !== void 0), [catalogs, sessionId]);
	const agents = (0, react.useMemo)(() => operations?.descendants.map((entry) => toAgentRow(entry)).filter((row) => row !== void 0) ?? fallbackAgents, [operations, fallbackAgents]);
	const relevantSessions = (0, react.useMemo)(() => /* @__PURE__ */ new Set([String(sessionId), ...agents.map((agent) => agent.id)]), [sessionId, agents]);
	const jobs = (0, react.useMemo)(() => Object.entries(jobsBySession).filter(([ownerSessionId]) => relevantSessions.has(ownerSessionId)).flatMap(([ownerSessionId, rows]) => (rows ?? []).map((job) => ({
		sessionId: ownerSessionId,
		job
	}))), [jobsBySession, relevantSessions]);
	const domain = {
		rootSessionId: String(sessionId),
		agents,
		jobs,
		groups,
		waits,
		teamAvailable: operations?.team.available ?? false,
		teamLive: operations?.team.live ?? false,
		teamMembers: operations?.team.members ?? [],
		tasks: operations?.team.tasks ?? [],
		messages: teamProjection?.messages ?? []
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GoodJobWorkspace, {
		domain,
		api,
		rpc,
		config,
		storage: typeof localStorage === "undefined" ? void 0 : localStorage,
		onRefresh: refresh,
		sessionViews: sessionViews.list(),
		sessionSlotHost: SessionSlotHost,
		onOpenSession: (agent) => {
			if (agent.id === String(sessionId)) return;
			openChild({
				parentSessionId: agent.parentId,
				childSessionId: agent.id,
				mode: agent.mode
			});
		}
	});
}
/** Render the IDE-style shell over current DSH projections. */
function GoodJobWorkspace(props) {
	const { domain, config, storage } = props;
	const storageKey = `goodjob.workspace.v1:${domain.rootSessionId}`;
	const [state, setState] = (0, react.useState)(() => config.restoreWorkspace ? restoreWorkspace(storage?.getItem(storageKey) ?? null) ?? initialWorkspaceState() : initialWorkspaceState());
	const [filter, setFilter] = (0, react.useState)("");
	const [explorerOpen, setExplorerOpen] = (0, react.useState)(true);
	(0, react.useEffect)(() => {
		if (!config.restoreWorkspace) {
			storage?.removeItem(storageKey);
			return;
		}
		storage?.setItem(storageKey, JSON.stringify(state));
	}, [
		config.restoreWorkspace,
		state,
		storage,
		storageKey
	]);
	const open = (0, react.useCallback)((entity) => {
		setState((current) => openEntity(current, entity));
		setExplorerOpen(false);
	}, []);
	const side = (0, react.useCallback)((entity, direction) => {
		setState((current) => openToSide(current, entity, direction));
	}, []);
	const activeKeys = new Set(state.panes.map((pane) => pane.activeKey));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "gj-workspace",
		"data-explorer-open": explorerOpen,
		"data-conversation-composer-overlay": "",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Explorer, {
			domain,
			config,
			filter,
			activeKeys,
			collapsed: state.collapsedSections,
			onFilter: setFilter,
			onOpen: open,
			onToggle: (kind) => {
				setState((current) => toggleSection(current, kind));
			}
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
			className: "gj-main",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gj-workspaceToolbar gj-toolbar",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gj-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "gj-iconButton gj-mobileExplorerToggle",
							onClick: () => {
								setExplorerOpen((value) => !value);
							},
							children: "Explorer"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "GoodJob Workspace" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "gj-meta",
							children: ["Session ", domain.rootSessionId]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gj-toolbar",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gj-iconButton",
						onClick: props.onRefresh,
						children: "Refresh adapters"
					})
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gj-panes",
				"data-direction": state.direction,
				"data-count": state.panes.length,
				children: state.panes.map((pane) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorPane, {
					pane,
					focused: state.focusedPaneId === pane.id,
					state,
					...props,
					onFocus: () => {
						setState((current) => ({
							...current,
							focusedPaneId: pane.id
						}));
					},
					onActivate: (key) => {
						setState((current) => activateEntity(current, pane.id, key));
					},
					onClose: (key) => {
						setState((current) => closeEntity(current, pane.id, key));
					},
					onOpen: open,
					onOpenSide: side,
					onClosePane: () => {
						setState((current) => closePane(current, pane.id));
					},
					onMove: (key, targetPaneId) => {
						setState((current) => moveEntity(current, pane.id, targetPaneId, key));
					}
				}, pane.id))
			})]
		})]
	});
}
function Explorer(props) {
	const query = props.filter.trim().toLowerCase();
	const matches = (value) => query.length === 0 || value.toLowerCase().includes(query);
	const agents = leadAndAgents(props.domain).filter((agent) => matches(agent.label ?? agent.id));
	const jobs = props.domain.jobs.filter((row) => props.config.showCompletedJobs || isLive(row.job)).filter((row) => matches(`${row.job.kind} ${row.job.label} ${row.job.id}`));
	const groups = props.domain.groups.filter((group) => matches(`${group.label} ${group.id}`));
	const waits = props.domain.waits.filter((wait) => matches(wait.id));
	const tasks = props.config.showTeamTasks ? props.domain.tasks.filter((task) => props.config.showCompletedTasks || task.status !== "completed").filter((task) => matches(`${task.subject} ${task.id}`)) : [];
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
		className: "gj-explorer",
		"aria-label": "GoodJob Explorer",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gj-explorerHeader",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
					className: "gj-explorerTitle",
					children: "Explorer"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gj-iconButton",
					"aria-label": "Open General",
					onClick: () => {
						props.onOpen({ kind: "general" });
					},
					children: "⌂"
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				className: "gj-filter",
				type: "search",
				"aria-label": "Filter workspace entities",
				placeholder: "Filter agents, jobs, tasks…",
				value: props.filter,
				onChange: (event) => {
					props.onFilter(event.target.value);
				}
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gj-explorerScroll",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerSection, {
						label: "Agents",
						kind: "agent",
						collapsed: props.collapsed,
						onToggle: props.onToggle,
						children: agents.map((agent) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerRow, {
							label: agent.label ?? agent.id,
							state: agent.activity,
							entity: {
								kind: "agent",
								sessionId: agent.id
							},
							activeKeys: props.activeKeys,
							onOpen: props.onOpen
						}, agent.id))
					}),
					props.config.showJobs ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerSection, {
						label: "Jobs",
						kind: "job",
						collapsed: props.collapsed,
						onToggle: props.onToggle,
						children: jobs.map(({ sessionId, job }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerRow, {
							label: job.label,
							state: job.status,
							entity: {
								kind: "job",
								sessionId,
								jobId: String(job.id)
							},
							activeKeys: props.activeKeys,
							onOpen: props.onOpen
						}, `${sessionId}:${job.id}`))
					}) : null,
					props.config.showGroups ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerSection, {
						label: "Job Groups",
						kind: "job-group",
						collapsed: props.collapsed,
						onToggle: props.onToggle,
						children: groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerRow, {
							label: group.label,
							state: groupStatus(group, props.domain.jobs),
							entity: {
								kind: "job-group",
								groupId: String(group.id)
							},
							activeKeys: props.activeKeys,
							onOpen: props.onOpen
						}, group.id))
					}) : null,
					props.config.showWaits ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerSection, {
						label: "Waits",
						kind: "wait",
						collapsed: props.collapsed,
						onToggle: props.onToggle,
						children: waits.map((wait) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerRow, {
							label: wait.id,
							state: wait.status,
							entity: {
								kind: "wait",
								waitId: wait.id
							},
							activeKeys: props.activeKeys,
							onOpen: props.onOpen
						}, wait.id))
					}) : null,
					props.config.showTeams && props.domain.teamAvailable && props.config.showTeamTasks ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerSection, {
						label: "Tasks",
						kind: "task",
						collapsed: props.collapsed,
						onToggle: props.onToggle,
						children: tasks.map((task) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerRow, {
							label: task.subject,
							state: taskState(task),
							entity: {
								kind: "task",
								taskId: task.id
							},
							activeKeys: props.activeKeys,
							onOpen: props.onOpen
						}, task.id))
					}) : null
				]
			})
		]
	});
}
function ExplorerSection(props) {
	const expanded = !props.collapsed.includes(props.kind);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "gj-explorerSection",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "gj-treeButton",
			"aria-expanded": expanded,
			onClick: () => {
				props.onToggle(props.kind);
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: expanded ? "⌄" : "›" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "gj-treeLabel",
					children: props.label
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {})
			]
		}), expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
			className: "gj-tree",
			children: props.children
		}) : null]
	});
}
function ExplorerRow(props) {
	const key = entityKey(props.entity);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "gj-treeButton",
		"aria-current": props.activeKeys.has(key),
		onClick: () => {
			props.onOpen(props.entity);
		},
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "gj-stateDot",
				"data-state": props.state
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "gj-treeLabel",
				title: props.label,
				children: props.label
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "gj-treeState",
				children: props.state
			})
		]
	}) });
}
function EditorPane(props) {
	const active = props.pane.tabs.find((tab) => entityKey(tab) === props.pane.activeKey) ?? props.pane.tabs[0];
	const otherPane = props.state.panes.find((pane) => pane.id !== props.pane.id);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "gj-pane",
		"data-focused": props.focused,
		"aria-label": `Workspace ${props.pane.id}`,
		onPointerDown: props.onFocus,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gj-paneHeader",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gj-tabs",
				role: "tablist",
				children: props.pane.tabs.map((tab) => {
					const key = entityKey(tab);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gj-tab",
						role: "tab",
						"aria-selected": key === props.pane.activeKey,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "gj-linkButton gj-tabLabel",
							title: entityLabel(tab, props.domain),
							onClick: () => {
								props.onActivate(key);
							},
							children: entityLabel(tab, props.domain)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "gj-iconButton gj-tabClose",
							"aria-label": `Close ${entityLabel(tab, props.domain)}`,
							onClick: () => {
								props.onClose(key);
							},
							children: "×"
						})]
					}, key);
				})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gj-paneActions",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gj-iconButton",
						title: "Split right",
						"aria-label": "Split right",
						disabled: props.state.panes.length >= 4,
						onClick: () => {
							props.onOpenSide(active, "vertical");
						},
						children: "◫"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gj-iconButton",
						title: "Split down",
						"aria-label": "Split down",
						disabled: props.state.panes.length >= 4,
						onClick: () => {
							props.onOpenSide(active, "horizontal");
						},
						children: "⬒"
					}),
					otherPane === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gj-iconButton",
						"aria-label": "Move active tab to other pane",
						onClick: () => {
							props.onMove(entityKey(active), otherPane.id);
						},
						children: "⇥"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gj-iconButton",
						"aria-label": "Close pane",
						disabled: props.state.panes.length === 1,
						onClick: props.onClosePane,
						children: "×"
					})
				]
			})]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "gj-editorStack",
			children: props.pane.tabs.map((entity) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gj-editor",
				hidden: entityKey(entity) !== props.pane.activeKey,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntityEditor, {
					...props,
					entity,
					active: entityKey(entity) === props.pane.activeKey
				})
			}, entityKey(entity)))
		})]
	});
}
function EntityEditor(props) {
	const { entity, domain } = props;
	switch (entity.kind) {
		case "general": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GeneralEditor, { ...props });
		case "agent": {
			const agent = leadAndAgents(domain).find((candidate) => candidate.id === entity.sessionId);
			return agent === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnavailableEditor, { entity }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentEditor, {
				...props,
				agent
			});
		}
		case "job": {
			const owned = domain.jobs.find((candidate) => candidate.sessionId === entity.sessionId && String(candidate.job.id) === entity.jobId);
			return owned === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnavailableEditor, { entity }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(JobEditor, {
				...props,
				owned
			});
		}
		case "job-group": {
			const group = domain.groups.find((candidate) => String(candidate.id) === entity.groupId);
			return group === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnavailableEditor, { entity }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GroupEditor, {
				...props,
				group
			});
		}
		case "wait": {
			const wait = domain.waits.find((candidate) => candidate.id === entity.waitId);
			return wait === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnavailableEditor, { entity }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WaitEditor, {
				...props,
				wait
			});
		}
		case "task": {
			const task = domain.tasks.find((candidate) => candidate.id === entity.taskId);
			return task === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnavailableEditor, { entity }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TaskEditor, {
				...props,
				task
			});
		}
		case "session-view": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionViewEditor, { ...props });
	}
}
function EditorTitle(props) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
		className: "gj-editorHeader",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
			className: "gj-title",
			children: props.title
		}), props.subtitle === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "gj-subtitle",
			children: props.subtitle
		})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gj-toolbar",
			children: [
				props.status === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "gj-badge",
					children: props.status
				}),
				props.actions,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gj-action",
					onClick: () => {
						props.onOpenSide(props.entity, "vertical");
					},
					children: "Open to side"
				})
			]
		})]
	});
}
function GeneralEditor(props) {
	const { domain, config, onOpen } = props;
	const allAgents = leadAndAgents(domain);
	const activeAgents = allAgents.filter((agent) => agent.activity === "running").length;
	const runningJobs = domain.jobs.filter((row) => isLive(row.job)).length;
	const waiting = domain.waits.filter((wait) => wait.status === "pending").length;
	const activeTasks = domain.tasks.filter((task) => task.status === "in_progress").length;
	const attention = [...domain.jobs.filter((row) => row.job.status === "failed").map((row) => ({
		key: `job:${row.sessionId}:${row.job.id}`,
		label: `${row.job.label} failed`,
		entity: {
			kind: "job",
			sessionId: row.sessionId,
			jobId: String(row.job.id)
		}
	})), ...domain.tasks.filter((task) => taskState(task) === "blocked").map((task) => ({
		key: `task:${task.id}`,
		label: `${task.subject} is blocked`,
		entity: {
			kind: "task",
			taskId: task.id
		}
	}))];
	const activities = activityEntries(domain).slice(0, 30);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorTitle, {
			title: "General",
			subtitle: `Current projections for Session ${domain.rootSessionId}`,
			entity: { kind: "general" },
			onOpenSide: props.onOpenSide
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gj-overview",
			"aria-label": "Operations overview",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
					value: `${activeAgents} active / ${allAgents.length - activeAgents} idle`,
					label: "Agents"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
					value: `${runningJobs} running / ${domain.jobs.length - runningJobs} settled`,
					label: "Jobs"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
					value: `${waiting} waiting / ${domain.waits.length - waiting} settled`,
					label: "Waits"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
					value: `${activeTasks} in progress / ${domain.tasks.filter((task) => taskState(task) === "blocked").length} blocked`,
					label: "Tasks"
				})
			]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gj-section",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: "gj-sectionTitle",
				children: "Attention"
			}), attention.length === 0 && (!config.showTeams || domain.teamAvailable) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "gj-quiet",
				children: "No failed Jobs or blocked tasks."
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
				className: "gj-list",
				children: [attention.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
					className: "gj-listRow gj-attention",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gj-linkButton gj-rowMain",
						onClick: () => {
							onOpen(item.entity);
						},
						children: item.label
					})
				}, item.key)), config.showTeams && !domain.teamAvailable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
					className: "gj-listRow gj-warning",
					children: "Agent Teams adapter unavailable; Team tabs and controls are hidden."
				}) : null]
			})]
		}),
		config.showActivityFeed ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gj-section",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: "gj-sectionTitle",
				children: "Activity"
			}), activities.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "gj-quiet",
				children: "No timestamped activity in current projections."
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: "gj-list",
				"aria-label": "Activity feed",
				children: activities.map((activity) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
					className: "gj-listRow",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
							className: "gj-meta",
							children: new Date(activity.time).toLocaleTimeString()
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "gj-linkButton gj-rowMain",
							onClick: () => {
								onOpen(activity.entity);
							},
							children: activity.label
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gj-meta",
							children: activity.source
						})
					]
				}, activity.key))
			})]
		}) : null,
		config.showGraph ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphView, {
			domain,
			onOpen
		}) : null
	] });
}
function Metric({ value, label }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "gj-metric",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "gj-metricValue",
			children: value
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "gj-metricLabel",
			children: label
		})]
	});
}
function GraphView({ domain, onOpen }) {
	const lead = leadAndAgents(domain)[0];
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "gj-section",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
			className: "gj-sectionTitle",
			children: "Graph"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
			className: "gj-graph",
			"aria-label": "Operations graph",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphAgentNode, {
				agent: lead,
				domain,
				onOpen,
				ancestry: /* @__PURE__ */ new Set(),
				root: true
			})
		})]
	});
}
function GraphAgentNode(props) {
	if (props.ancestry.has(props.agent.id)) return null;
	const ancestry = new Set(props.ancestry).add(props.agent.id);
	const children = props.domain.agents.filter((agent) => agent.parentId === props.agent.id);
	const jobs = props.domain.jobs.filter((row) => row.sessionId === props.agent.id || props.agent.relatedJobIds.includes(String(row.job.id)));
	const member = props.domain.teamMembers.find((candidate) => candidate.id === props.agent.id);
	const tasks = props.domain.tasks.filter((task) => task.ownerName === member?.name);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
		type: "button",
		className: "gj-linkButton",
		onClick: () => {
			props.onOpen({
				kind: "agent",
				sessionId: props.agent.id
			});
		},
		children: props.agent.label ?? props.agent.id
	}), children.length === 0 && jobs.length === 0 && tasks.length === 0 && !props.root ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", { children: [
		children.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphAgentNode, {
			agent: child,
			domain: props.domain,
			onOpen: props.onOpen,
			ancestry
		}, child.id)),
		jobs.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "gj-linkButton",
			onClick: () => {
				props.onOpen({
					kind: "job",
					sessionId: row.sessionId,
					jobId: String(row.job.id)
				});
			},
			children: [
				row.job.label,
				" · ",
				row.job.status
			]
		}) }, `${row.sessionId}:${row.job.id}`)),
		tasks.map((task) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "gj-linkButton",
			onClick: () => {
				props.onOpen({
					kind: "task",
					taskId: task.id
				});
			},
			children: [
				task.subject,
				" · ",
				taskState(task)
			]
		}) }, task.id)),
		props.root ? props.domain.waits.map((wait) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "gj-linkButton",
			onClick: () => {
				props.onOpen({
					kind: "wait",
					waitId: wait.id
				});
			},
			children: [
				wait.id,
				" · ",
				wait.status
			]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: wait.leaves.map((leaf) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphLeaf, {
			leaf,
			domain: props.domain,
			onOpen: props.onOpen
		}, leaf.index)) })] }, wait.id)) : null
	] })] });
}
function GraphLeaf(props) {
	const input = recordValue(props.leaf.input);
	const jobId = typeof input?.job_id === "string" ? input.job_id : void 0;
	const taskId = typeof input?.task_id === "string" ? input.task_id : void 0;
	const job = jobId === void 0 ? void 0 : props.domain.jobs.find((row) => String(row.job.id) === jobId);
	const entity = job !== void 0 ? {
		kind: "job",
		sessionId: job.sessionId,
		jobId: String(job.job.id)
	} : taskId === void 0 ? void 0 : {
		kind: "task",
		taskId
	};
	const label = job?.job.label ?? props.domain.tasks.find((task) => task.id === taskId)?.subject ?? props.leaf.provider ?? `condition ${props.leaf.index + 1}`;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
		entity === void 0 ? label : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "gj-linkButton",
			onClick: () => {
				props.onOpen(entity);
			},
			children: label
		}),
		" ",
		props.leaf.result === void 0 ? "…" : "✓"
	] });
}
function AgentEditor(props) {
	const { agent, domain } = props;
	const teamMember = domain.teamMembers.find((member) => member.id === agent.id);
	const relatedJobs = domain.jobs.filter((row) => row.sessionId === agent.id || agent.relatedJobIds.includes(String(row.job.id)));
	const relatedTasks = domain.tasks.filter((task) => task.ownerName === teamMember?.name);
	const mailbox = domain.messages.filter((message) => message.senderId === agent.id || message.targetId === agent.id || message.targetId === teamMember?.name).slice(-20).reverse();
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorTitle, {
			title: agent.label ?? agent.id,
			subtitle: `Session ${agent.id} · Parent ${agent.parentId || "none"} · ${agent.mode}`,
			status: agent.activity,
			entity: {
				kind: "agent",
				sessionId: agent.id
			},
			onOpenSide: props.onOpenSide,
			actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionViewActions, {
				...props,
				agent
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentControls, {
				...props,
				agent,
				teamMember
			})] })
		}),
		agent.model === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
			className: "gj-fields",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Provider/model" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: agent.model })]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gj-section",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: "gj-sectionTitle",
				children: "Transcript / Activity"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "gj-quiet",
				children: "Session messages and tool calls remain in the DSH conversation. Open Session navigates to that authoritative transcript."
			})]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RelatedList, {
			title: "Jobs",
			empty: "No related Jobs.",
			rows: relatedJobs.map((row) => ({
				key: `${row.sessionId}:${row.job.id}`,
				label: row.job.label,
				state: row.job.status,
				entity: {
					kind: "job",
					sessionId: row.sessionId,
					jobId: String(row.job.id)
				}
			})),
			onOpen: props.onOpen
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RelatedList, {
			title: "Tasks",
			empty: "No owned Team tasks.",
			rows: relatedTasks.map((task) => ({
				key: task.id,
				label: task.subject,
				state: taskState(task),
				entity: {
					kind: "task",
					taskId: task.id
				}
			})),
			onOpen: props.onOpen
		}),
		props.config.showTeamMailbox ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gj-section",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: "gj-sectionTitle",
				children: "Mailbox"
			}), mailbox.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "gj-quiet",
				children: "No mailbox activity for this agent."
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: "gj-list",
				children: mailbox.map((message) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
					className: "gj-listRow gj-mailMessage",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "gj-meta",
							children: [
								message.senderName,
								" → ",
								message.targetId
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gj-rowMain gj-mailText",
							children: message.text
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "gj-meta",
							children: [
								message.delivery,
								" · ",
								message.delivered ? "delivered" : "queued"
							]
						}),
						teamMember?.role === "teammate" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TeamReply, {
							...props,
							targetName: teamMember.name
						}) : null
					]
				}, message.id))
			})]
		}) : null
	] });
}
function SessionViewActions(props) {
	const views = props.sessionViews.filter((view) => view.id !== "goodjob");
	return views.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "gj-toolbar",
		"aria-label": `Session views for ${props.agent.label ?? props.agent.id}`,
		children: views.map((view) => {
			const entity = {
				kind: "session-view",
				sessionId: props.agent.id,
				viewId: view.id
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "gj-toolbar",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "gj-action",
					onClick: () => {
						props.onOpen(entity);
					},
					children: ["Open ", view.label]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gj-iconButton",
					"aria-label": `Open ${view.label} to side`,
					onClick: () => {
						props.onOpenSide(entity, "vertical");
					},
					children: "◫"
				})]
			}, view.id);
		})
	});
}
function TeamReply(props) {
	const [open, setOpen] = (0, react.useState)(false);
	const [draft, setDraft] = (0, react.useState)("");
	const [delivery, setDelivery] = (0, react.useState)("quiet");
	const [busy, setBusy] = (0, react.useState)(false);
	const send = async () => {
		if (draft.trim().length === 0) return;
		setBusy(true);
		try {
			if ((await props.rpc.call("/goodjob", "team.message", {
				sessionId: props.domain.rootSessionId,
				target: props.targetName,
				delivery,
				text: draft.trim()
			})).ok) {
				setDraft("");
				setOpen(false);
				props.onRefresh();
			}
		} finally {
			setBusy(false);
		}
	};
	return open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
		className: "gj-toolbar",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				"aria-label": `Reply to ${props.targetName}`,
				value: draft,
				onChange: (event) => {
					setDraft(event.target.value);
				}
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
				"aria-label": "Reply delivery",
				value: delivery,
				onChange: (event) => {
					setDelivery(event.target.value);
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
					value: "quiet",
					children: "Quiet"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
					value: "wakeup",
					children: "Wake"
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "gj-action",
				disabled: busy || draft.trim().length === 0,
				onClick: () => {
					send();
				},
				children: "Send reply"
			})
		]
	}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
		type: "button",
		className: "gj-action",
		onClick: () => {
			setOpen(true);
		},
		children: "Reply"
	});
}
function AgentControls(props) {
	const { agent, teamMember } = props;
	const [composing, setComposing] = (0, react.useState)(false);
	const [draft, setDraft] = (0, react.useState)("");
	const [delivery, setDelivery] = (0, react.useState)("quiet");
	const [busy, setBusy] = (0, react.useState)(false);
	const [error, setError] = (0, react.useState)();
	const root = agent.id === props.domain.rootSessionId;
	const send = async () => {
		const text = draft.trim();
		if (text.length === 0) return;
		setBusy(true);
		setError(void 0);
		try {
			if (teamMember?.role === "teammate") {
				const result = await props.rpc.call("/goodjob", "team.message", {
					sessionId: props.domain.rootSessionId,
					target: teamMember.name,
					delivery,
					text
				});
				if (!result.ok) throw new Error(result.error.message);
				props.onRefresh();
			} else await props.api.subagents.prompt({
				parentSessionId: agent.parentId,
				childSessionId: agent.id,
				mode: "continuable",
				content: [{
					type: "text",
					text
				}]
			});
			setDraft("");
			setComposing(false);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : String(cause));
		} finally {
			setBusy(false);
		}
	};
	const interrupt = async () => {
		if (!window.confirm("Interrupt the current turn? The session remains continuable.")) return;
		setBusy(true);
		try {
			if (teamMember?.role === "teammate") {
				const result = await props.rpc.call("/goodjob", "team.interrupt", {
					sessionId: props.domain.rootSessionId,
					target: teamMember.name
				});
				if (!result.ok) throw new Error(result.error.message);
				props.onRefresh();
			} else await props.api.subagents.interrupt({
				parentSessionId: agent.parentId,
				childSessionId: agent.id,
				mode: "continuable"
			});
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : String(cause));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "gj-toolbar",
		children: [
			root ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "gj-meta",
				children: "Current Session"
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "gj-action",
				onClick: () => {
					props.onOpenSession(agent);
				},
				children: "Open Session"
			}),
			root || agent.mode !== "continuable" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "gj-action",
				onClick: () => {
					setComposing((value) => !value);
				},
				children: "Message"
			}),
			root || agent.mode !== "continuable" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "gj-action",
				disabled: busy,
				onClick: () => {
					interrupt();
				},
				children: "Interrupt"
			}),
			composing ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gj-composer",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						className: "gj-composerInput",
						"aria-label": `Message ${agent.label ?? agent.id}`,
						rows: 2,
						value: draft,
						onChange: (event) => {
							setDraft(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gj-composerRow",
						children: [teamMember?.role === "teammate" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							"aria-label": "Delivery",
							value: delivery,
							onChange: (event) => {
								setDelivery(event.target.value);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "quiet",
								children: "Quiet"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "wakeup",
								children: "Wake"
							})]
						}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "gj-action",
							disabled: busy || draft.trim().length === 0,
							onClick: () => {
								send();
							},
							children: "Send"
						})]
					}),
					error === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "gj-error",
						children: error
					})
				]
			}) : null
		]
	});
}
function RelatedList(props) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "gj-section",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
			className: "gj-sectionTitle",
			children: props.title
		}), props.rows.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "gj-quiet",
			children: props.empty
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
			className: "gj-list",
			children: props.rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: "gj-listRow",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gj-stateDot",
						"data-state": row.state
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gj-linkButton gj-rowMain",
						onClick: () => {
							props.onOpen(row.entity);
						},
						children: row.label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gj-meta",
						children: row.state
					})
				]
			}, row.key))
		})]
	});
}
function JobEditor(props) {
	const { owned, config, active } = props;
	const [output, setOutput] = (0, react.useState)("");
	const [observedJob, setObservedJob] = (0, react.useState)(owned.job);
	const [truncated, setTruncated] = (0, react.useState)(false);
	const [query, setQuery] = (0, react.useState)("");
	const [copied, setCopied] = (0, react.useState)(false);
	const cursor = (0, react.useRef)(0);
	(0, react.useEffect)(() => {
		setObservedJob(owned.job);
	}, [owned.job]);
	(0, react.useEffect)(() => {
		if (!active) return;
		let cancelled = false;
		let timer;
		const observe = async () => {
			do {
				const response = await props.api.jobs.observe({
					sessionId: owned.sessionId,
					jobId: owned.job.id,
					afterSequence: cursor.current
				});
				if (cancelled || !response.result.ok) return;
				const value = response.result.value;
				cursor.current = value.nextSequence;
				setObservedJob(value.job);
				if (value.truncated) setTruncated(true);
				const addition = value.chunks.map((chunk) => chunk.text).join("");
				if (addition.length > 0) setOutput((previous) => {
					const combined = previous + addition;
					if (combined.length <= config.maxRenderedOutputChars) return combined;
					setTruncated(true);
					return combined.slice(-config.maxRenderedOutputChars);
				});
				if (value.hasMore) continue;
				if (config.autoFollowOutput && isLive(value.job)) timer = setTimeout(() => {
					observe();
				}, config.outputObserveIntervalMs);
				return;
			} while (!cancelled);
		};
		observe().catch(() => {});
		return () => {
			cancelled = true;
			if (timer !== void 0) clearTimeout(timer);
		};
	}, [
		active,
		config.autoFollowOutput,
		config.maxRenderedOutputChars,
		config.outputObserveIntervalMs,
		owned.job.id,
		owned.sessionId,
		props.api.jobs
	]);
	const visibleOutput = query.trim().length === 0 ? output : output.split("\n").filter((line) => line.toLowerCase().includes(query.trim().toLowerCase())).join("\n");
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorTitle, {
			title: observedJob.label,
			subtitle: `Job ${observedJob.id} · ${observedJob.kind} · Owner Session ${owned.sessionId}`,
			status: observedJob.status,
			entity: {
				kind: "job",
				sessionId: owned.sessionId,
				jobId: String(observedJob.id)
			},
			onOpenSide: props.onOpenSide
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
			className: "gj-fields",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Started" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: new Date(observedJob.startedAt).toLocaleString() }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Elapsed" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: formatElapsed(observedJob.startedAt, observedJob.finishedAt) }),
				observedJob.detail === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Detail" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: observedJob.detail })] })
			]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gj-section",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: "gj-sectionTitle",
					children: "Live Output"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gj-logToolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "gj-filter",
							style: {
								margin: 0,
								width: "100%"
							},
							type: "search",
							"aria-label": "Search Job output",
							placeholder: "Search output",
							value: query,
							onChange: (event) => {
								setQuery(event.target.value);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "gj-action",
							onClick: () => {
								navigator.clipboard?.writeText(output).then(() => {
									setCopied(true);
								});
							},
							children: copied ? "Copied" : "Copy"
						}),
						truncated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gj-warning",
							children: "Older retained output is truncated."
						}) : null
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					className: "gj-log",
					"aria-label": `Output for ${observedJob.label}`,
					children: visibleOutput
				})
			]
		})
	] });
}
function GroupEditor(props) {
	const jobs = new Map(props.domain.jobs.map((row) => [String(row.job.id), row]));
	const settled = props.group.jobIds.filter((id) => {
		const job = jobs.get(id)?.job;
		return job !== void 0 && !isLive(job);
	}).length;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorTitle, {
		title: props.group.label,
		subtitle: `Job Group ${props.group.id} · revision ${props.group.revision}`,
		status: `${settled} / ${props.group.jobIds.length} settled`,
		entity: {
			kind: "job-group",
			groupId: String(props.group.id)
		},
		onOpenSide: props.onOpenSide
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "gj-section",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
			className: "gj-sectionTitle",
			children: "Members"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
			className: "gj-list",
			children: props.group.jobIds.map((id) => {
				const row = jobs.get(id);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
					className: "gj-listRow",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gj-stateDot",
							"data-state": row?.job.status ?? "unavailable"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "gj-linkButton gj-rowMain",
							disabled: row === void 0,
							onClick: () => {
								if (row !== void 0) props.onOpen({
									kind: "job",
									sessionId: row.sessionId,
									jobId: String(row.job.id)
								});
							},
							children: row?.job.label ?? id
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gj-meta",
							children: row?.job.status ?? "unavailable"
						})
					]
				}, id);
			})
		})]
	})] });
}
function WaitEditor(props) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorTitle, {
			title: props.wait.id,
			subtitle: `Created ${new Date(props.wait.createdAt).toLocaleString()}`,
			status: props.wait.status,
			entity: {
				kind: "wait",
				waitId: props.wait.id
			},
			onOpenSide: props.onOpenSide
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
			className: "gj-fields",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Mode" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: props.wait.mode.toUpperCase() }),
				props.wait.winnerIndex === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Winning leaf" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: ["#", props.wait.winnerIndex] })] })
			]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gj-section",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: "gj-sectionTitle",
				children: "Conditions"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: "gj-list",
				children: props.wait.leaves.map((leaf) => {
					const linked = leafEntity(leaf, props.domain);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: "gj-listRow",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: leaf.result === void 0 ? "…" : "✓" }),
							linked === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gj-rowMain",
								children: leaf.provider ?? `condition ${leaf.index + 1}`
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "gj-linkButton gj-rowMain",
								onClick: () => {
									props.onOpen(linked);
								},
								children: leafLabel(leaf, props.domain)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gj-meta",
								children: leaf.result === void 0 ? "pending" : "settled"
							})
						]
					}, leaf.index);
				})
			})]
		})
	] });
}
function TaskEditor(props) {
	const [busy, setBusy] = (0, react.useState)(false);
	const [error, setError] = (0, react.useState)();
	const reassign = async (owner) => {
		setBusy(true);
		setError(void 0);
		try {
			const result = await props.rpc.call("/goodjob", "team.reassign", {
				sessionId: props.domain.rootSessionId,
				taskId: props.task.id,
				expectedRevision: props.task.revision,
				owner
			});
			if (!result.ok) throw new Error(result.error.message);
			props.onRefresh();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : String(cause));
		} finally {
			setBusy(false);
		}
	};
	const owner = props.domain.teamMembers.find((member) => member.name === props.task.ownerName);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorTitle, {
			title: props.task.subject,
			subtitle: `Team task ${props.task.id} · revision ${props.task.revision}`,
			status: taskState(props.task),
			entity: {
				kind: "task",
				taskId: props.task.id
			},
			onOpenSide: props.onOpenSide
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: props.task.description }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
			className: "gj-fields",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Owner" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: owner === void 0 ? props.task.ownerName ?? "Unassigned" : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gj-linkButton",
					onClick: () => {
						props.onOpen({
							kind: "agent",
							sessionId: owner.id
						});
					},
					children: owner.name
				}) }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Ready" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: props.task.ready ? "yes" : "no" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Blocked by" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: props.task.blockedBy.length === 0 ? "none" : props.task.blockedBy.map((id, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [index > 0 ? ", " : "", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gj-linkButton",
					onClick: () => {
						props.onOpen({
							kind: "task",
							taskId: id
						});
					},
					children: id
				})] }, id)) }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Write scopes" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: props.task.writeScopes.join(", ") || "none" })
			]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gj-section",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: "gj-sectionTitle",
					children: "Reassign"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
					"aria-label": `Reassign ${props.task.subject}`,
					value: props.task.ownerName ?? "",
					disabled: busy || props.task.status === "completed" || props.task.status === "deleted",
					onChange: (event) => {
						reassign(event.target.value);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value: "",
						children: "Unassigned"
					}), props.domain.teamMembers.map((member) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value: member.name,
						children: member.name
					}, member.id))]
				}),
				error === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "gj-error",
					children: error
				})
			]
		})
	] });
}
function SessionViewEditor(props) {
	if (props.entity.kind !== "session-view") return null;
	const entity = props.entity;
	const agent = leadAndAgents(props.domain).find((candidate) => candidate.id === entity.sessionId);
	const label = props.sessionViews.find((view) => view.id === entity.viewId)?.label ?? entity.viewId;
	const fallback = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "gj-sessionViewUnavailable",
		role: "status",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
			className: "gj-sectionTitle",
			children: "View unavailable"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
			className: "gj-quiet",
			children: [
				"The registered conversation view “",
				entity.viewId,
				"” is not currently available. The workspace tab retains only its presentation identity and will recover if the plugin registers the view again."
			]
		})]
	});
	const Host = props.sessionSlotHost;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorTitle, {
		title: `${agent?.label ?? entity.sessionId} / ${label}`,
		subtitle: `Session ${entity.sessionId} · registered conversation view ${entity.viewId}`,
		entity,
		onOpenSide: props.onOpenSide
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "gj-sessionViewHost",
		children: Host === void 0 ? fallback : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Host, {
			name: "conversation.view",
			sessionId: entity.sessionId,
			owner: {
				inspect: null,
				onInspectDone: () => {}
			},
			opts: {
				only: entity.viewId,
				fallback
			}
		})
	})] });
}
function UnavailableEditor({ entity }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
		className: "gj-title",
		children: "Unavailable"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
		className: "gj-quiet",
		children: [entityKey(entity), " is no longer present in the current DSH projection. Close this presentation tab or refresh the owning capability."]
	})] });
}
function leadAndAgents(domain) {
	return [{
		id: domain.rootSessionId,
		parentId: "",
		depth: 0,
		label: "Lead",
		mode: "continuable",
		activity: domain.agents.some((agent) => agent.activity === "running") || domain.jobs.some((row) => row.sessionId === domain.rootSessionId && isLive(row.job)) ? "running" : "inactive",
		relatedJobIds: domain.jobs.filter((row) => row.sessionId === domain.rootSessionId).map((row) => String(row.job.id))
	}, ...domain.agents];
}
function entityLabel(entity, domain) {
	switch (entity.kind) {
		case "general": return "General";
		case "agent": return leadAndAgents(domain).find((agent) => agent.id === entity.sessionId)?.label ?? entity.sessionId;
		case "job": return domain.jobs.find((row) => row.sessionId === entity.sessionId && String(row.job.id) === entity.jobId)?.job.label ?? entity.jobId;
		case "job-group": return domain.groups.find((group) => String(group.id) === entity.groupId)?.label ?? entity.groupId;
		case "wait": return entity.waitId;
		case "task": return domain.tasks.find((task) => task.id === entity.taskId)?.subject ?? entity.taskId;
		case "session-view": return `${leadAndAgents(domain).find((candidate) => candidate.id === entity.sessionId)?.label ?? entity.sessionId} / ${entity.viewId}`;
	}
}
function taskState(task) {
	return task.status === "pending" && task.blockedBy.length > 0 ? "blocked" : task.status;
}
function groupStatus(group, jobs) {
	const byId = new Map(jobs.map((row) => [String(row.job.id), row.job]));
	const members = group.jobIds.map((id) => byId.get(id));
	if (members.some((job) => job?.status === "failed")) return "failed";
	if (members.some((job) => job !== void 0 && isLive(job))) return "running";
	return members.every((job) => job?.status === "completed") ? "completed" : "settled";
}
function activityEntries(domain) {
	const entries = [];
	for (const { sessionId, job } of domain.jobs) {
		entries.push({
			key: `job-start:${sessionId}:${job.id}`,
			time: job.startedAt,
			source: "Jobs",
			label: `${job.label} started`,
			entity: {
				kind: "job",
				sessionId,
				jobId: String(job.id)
			}
		});
		if (job.finishedAt !== void 0) entries.push({
			key: `job-finish:${sessionId}:${job.id}`,
			time: job.finishedAt,
			source: "Jobs",
			label: `${job.label} ${job.status}`,
			entity: {
				kind: "job",
				sessionId,
				jobId: String(job.id)
			}
		});
	}
	for (const wait of domain.waits) entries.push({
		key: `wait:${wait.id}`,
		time: wait.createdAt,
		source: "Waits",
		label: `${wait.id} created (${wait.mode.toUpperCase()})`,
		entity: {
			kind: "wait",
			waitId: wait.id
		}
	});
	for (const group of domain.groups) entries.push({
		key: `group:${group.id}`,
		time: group.createdAt,
		source: "Groups",
		label: `${group.label} created`,
		entity: {
			kind: "job-group",
			groupId: String(group.id)
		}
	});
	for (const message of domain.messages) entries.push({
		key: `message:${message.id}`,
		time: message.queuedAt,
		source: "Teams",
		label: `${message.senderName} messaged ${message.targetId} (${message.delivery})`,
		entity: message.senderId === domain.rootSessionId ? {
			kind: "agent",
			sessionId: domain.rootSessionId
		} : {
			kind: "agent",
			sessionId: message.senderId
		}
	});
	return entries.sort((left, right) => right.time - left.time);
}
function recordValue(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function leafEntity(leaf, domain) {
	const input = recordValue(leaf.input);
	const jobId = typeof input?.job_id === "string" ? input.job_id : void 0;
	if (jobId !== void 0) {
		const job = domain.jobs.find((row) => String(row.job.id) === jobId);
		if (job !== void 0) return {
			kind: "job",
			sessionId: job.sessionId,
			jobId
		};
	}
	const taskId = typeof input?.task_id === "string" ? input.task_id : void 0;
	return taskId === void 0 ? void 0 : {
		kind: "task",
		taskId
	};
}
function leafLabel(leaf, domain) {
	const entity = leafEntity(leaf, domain);
	if (entity?.kind === "job") return domain.jobs.find((row) => String(row.job.id) === entity.jobId)?.job.label ?? entity.jobId;
	if (entity?.kind === "task") return domain.tasks.find((task) => task.id === entity.taskId)?.subject ?? entity.taskId;
	return leaf.provider ?? `condition ${leaf.index + 1}`;
}
function formatElapsed(startedAt, finishedAt) {
	const total = Math.max(0, Math.floor(((finishedAt ?? Date.now()) - startedAt) / 1e3));
	const seconds = total % 60;
	const minutes = Math.floor(total / 60) % 60;
	const hours = Math.floor(total / 3600);
	return hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
//#endregion
//#region src/client/index.ts
/** Required services for locale registration, the connection face, slots, and sessions. */
const inject = [
	"sessions",
	"slots",
	"locale",
	"connection"
];
/** Read the sessions service structurally; out-of-tree builds must not depend
* on host/client augmentation order for the Cordis context merge. */
function sessionsFace(ctx) {
	return ctx.sessions;
}
/**
* Client plugin body: register the dictionaries, native workspace view, and
* settings card keyed by the `goodjob` namespace.
* @param ctx - client root context.
* @param config - host-side config echoed through the client graph.
*/
function apply(ctx, config = {}) {
	const resolved = {
		showJobs: config.showJobs ?? DEFAULTS.showJobs,
		showWaits: config.showWaits ?? DEFAULTS.showWaits,
		showSubagents: config.showSubagents ?? DEFAULTS.showSubagents,
		showGroups: config.showGroups ?? DEFAULTS.showGroups,
		autoExpandActiveGroups: config.autoExpandActiveGroups ?? DEFAULTS.autoExpandActiveGroups,
		showTeams: config.showTeams ?? DEFAULTS.showTeams,
		showTeamMailbox: config.showTeamMailbox ?? DEFAULTS.showTeamMailbox,
		showTeamTasks: config.showTeamTasks ?? DEFAULTS.showTeamTasks,
		autoFollowOutput: config.autoFollowOutput ?? DEFAULTS.autoFollowOutput,
		restoreWorkspace: config.restoreWorkspace ?? DEFAULTS.restoreWorkspace,
		showActivityFeed: config.showActivityFeed ?? DEFAULTS.showActivityFeed,
		showGraph: config.showGraph ?? DEFAULTS.showGraph,
		showCompletedJobs: config.showCompletedJobs ?? DEFAULTS.showCompletedJobs,
		showCompletedTasks: config.showCompletedTasks ?? DEFAULTS.showCompletedTasks,
		maxRenderedOutputChars: config.maxRenderedOutputChars ?? DEFAULTS.maxRenderedOutputChars,
		outputObserveIntervalMs: config.outputObserveIntervalMs ?? DEFAULTS.outputObserveIntervalMs
	};
	ctx.effect(() => {
		if (document.querySelector("style[data-plugin=\"dsh-goodjob\"]") !== null) return () => {};
		const tag = document.createElement("style");
		tag.dataset.plugin = "dsh-goodjob";
		tag.textContent = STYLES;
		document.head.appendChild(tag);
		return () => {
			tag.remove();
		};
	}, "goodjob: stylesheet");
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en
	}), "goodjob: dictionaries");
	const t = ctx.locale.bind(NS);
	const sessionViews = {
		list: () => ctx.slots.entries("conversation.view").flatMap((entry) => {
			const id = entry.options.id;
			return id === void 0 ? [] : [{
				id,
				label: (0, _deepseek_ai_dsh_client_ui_slots.resolveSlotLabel)(entry.options.label) ?? id
			}];
		}),
		subscribe: (listener) => ctx.slots.subscribe("conversation.view", listener),
		version: () => ctx.slots.getVersion("conversation.view")
	};
	const injected = () => ({
		api: ctx.get("connection").api,
		rpc: ctx.get("connection").rpc,
		config: resolved,
		refreshSubagents: (parentSessionId) => sessionsFace(ctx).refreshSubagents(parentSessionId),
		openChild: (address) => sessionsFace(ctx).openSubagent(address),
		sessionViews
	});
	ctx.slots.inject("conversation.view", () => ctx.slots.register({
		name: "conversation.view",
		id: "goodjob",
		order: 30,
		locale: NS,
		label: () => t("view.workspace"),
		inject: injected
	}, WorkspaceView));
	ctx.slots.inject("settings.plugin.item", function* () {
		yield ctx.slots.register({
			name: "settings.plugin.item",
			key: "goodjob",
			locale: NS,
			inject: () => ({ api: ctx.get("connection").api })
		}, GoodJobSettingsCard);
	});
}
//#endregion
exports.apply = apply;
exports.inject = inject;

return module.exports; } });
//# sourceMappingURL=client.js.map