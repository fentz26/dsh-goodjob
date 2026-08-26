window.__ModuleLoader__.load({ id: "dsh-goodjob", factory: (require) => {
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/config-types.ts
/** Defaults for absent keys, mirrored by the client card. */
const DEFAULTS = {
	showJobs: true,
	showWaits: true,
	showSubagents: true,
	autoFollowOutput: true
};
//#endregion
//#region src/client/locales.ts
/** Locale namespace owned by the operations view. */
const NS = "goodjob";
/** Chinese product copy. */
const zh = {
	"title": "GoodJob 运维面板",
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
  letter-spacing: 0.gj-06em;
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
.gj-waits {
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
  opacity: 0.gj-5;
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
`;
/** Class-name map mirroring the stylesheet's selectors. */
const css = {
	"action": "gj-action",
	"agentActions": "gj-agentActions",
	"agentDot": "gj-agentDot",
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
	"output": "gj-output",
	"primary": "gj-primary",
	"ready": "gj-ready",
	"root": "gj-root",
	"trigger": "gj-trigger",
	"waitMode": "gj-waitMode",
	"waitRow": "gj-waitRow",
	"waitStatus": "gj-waitStatus",
	"waits": "gj-waits",
	"winner": "gj-winner"
};
//#endregion
//#region src/client/AgentsList.tsx
/**
* Agents section: one row per direct subagent child of the current session.
*
* Data comes from the existing `subagentsByParent` catalog mirror; message
* and interrupt go through the existing subagent RPCs, so no duplicate
* conversation is created, delivery keeps the host's FIFO queueing, and
* interruption only ends the current turn.
* @module dsh-goodjob/client/AgentsList
*/
/**
* Render the agents section body with per-row actions.
* @param props - parent id, agents, API, translator.
* @returns the list, or the empty line.
*/
function AgentsList({ sessionId, agents, subagentsApi, onOpen, t }) {
	const [composingFor, setComposingFor] = (0, react.useState)();
	const [draft, setDraft] = (0, react.useState)("");
	const [busy, setBusy] = (0, react.useState)(false);
	if (agents.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		className: css.empty,
		children: t("agents.empty")
	});
	const send = async (childSessionId) => {
		if (draft.trim().length === 0) return;
		setBusy(true);
		try {
			await subagentsApi.prompt({
				parentSessionId: sessionId,
				childSessionId,
				mode: "continuable",
				content: [{
					type: "text",
					text: draft
				}]
			});
			setDraft("");
			setComposingFor(void 0);
		} finally {
			setBusy(false);
		}
	};
	const interrupt = async (childSessionId) => {
		if (!window.confirm(t("agents.interruptConfirm"))) return;
		setBusy(true);
		try {
			await subagentsApi.interrupt({
				parentSessionId: sessionId,
				childSessionId,
				mode: "continuable"
			});
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
		className: css.agents,
		"aria-label": t("section.agents"),
		children: agents.map((agent) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
			className: css.agentRow,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: `${css.agentDot} ${agent.activity === "running" ? css.agentRunning : ""}`,
					title: t(agent.activity === "running" ? "status.running" : "status.inactive")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.agentLabel,
					children: agent.label ?? agent.id
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.agentMode,
					children: agent.mode
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: css.agentActions,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							onClick: () => {
								onOpen(agent.id);
							},
							children: t("agents.open")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							onClick: () => {
								setComposingFor(agent.id);
							},
							children: t("agents.message")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							disabled: busy,
							onClick: () => {
								interrupt(agent.id);
							},
							children: t("agents.interrupt")
						})
					]
				}),
				composingFor === agent.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.composer,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						className: css.composerInput,
						placeholder: t("agents.messagePlaceholder"),
						value: draft,
						rows: 2,
						onChange: (event) => {
							setDraft(event.target.value);
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.composerRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							onClick: () => {
								setComposingFor(void 0);
							},
							children: t("common.close")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${css.action} ${css.primary}`,
							disabled: busy || draft.trim().length === 0,
							onClick: () => {
								send(agent.id);
							},
							children: t("agents.send")
						})]
					})]
				}) : null
			]
		}, agent.id))
	});
}
/** Narrow a raw catalog entry to the renderable child shape; diagnostics rows are skipped. */
function toAgentRow(entry) {
	if (typeof entry !== "object" || entry === null) return void 0;
	const candidate = entry;
	if (candidate.kind !== "child") return void 0;
	if (candidate.mode !== "one-shot" && candidate.mode !== "continuable") return void 0;
	if (candidate.activity !== "running" && candidate.activity !== "inactive") return void 0;
	return {
		id: String(candidate.id),
		label: typeof candidate.label === "string" ? candidate.label : void 0,
		mode: candidate.mode,
		activity: candidate.activity
	};
}
//#endregion
//#region src/client/WaitsList.tsx
/** Human word for one folded lifecycle state. */
function statusKey(status) {
	return `waits.status.${status}`;
}
/**
* Render one leaf: settled leaves show their provider with a check, pending
* ones an ellipsis. Leaf input stays inspectable through the title
* attribute without growing the visible row.
*/
function Leaf({ leaf }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
		className: leaf.result !== void 0 ? css.leafDone : css.leaf,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: css.leafMark,
			children: leaf.result !== void 0 ? "✓" : "…"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			title: JSON.stringify(leaf.input) ?? "",
			children: leaf.provider ?? `#${leaf.index}`
		})]
	});
}
/**
* Render the waits section body.
* @param props - waits and translator.
* @returns the list, or the empty line.
*/
function WaitsList({ waits, t }) {
	if (waits.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		className: css.empty,
		children: t("waits.empty")
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
		className: css.waits,
		"aria-label": t("section.waits"),
		children: waits.map((wait) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
			className: css.waitRow,
			"data-status": wait.status,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: `${css.waitStatus} ${css[wait.status] ?? ""}`,
					children: t(statusKey(wait.status))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.waitMode,
					children: t(wait.mode === "any" ? "waits.mode.any" : "waits.mode.all")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: css.leaves,
					children: wait.leaves.map((leaf) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Leaf, { leaf }, leaf.index))
				}),
				wait.winnerIndex !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: css.winner,
					children: ["#", wait.winnerIndex]
				}) : null
			]
		}, wait.id))
	});
}
//#endregion
//#region src/client/OperationsAction.tsx
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
/** Stable empty list so idle sessions keep one array identity. */
const NO_JOBS = [];
/** A job whose duration still ticks. */
function isLive(job) {
	return job.status === "running" || job.status === "stopping";
}
/**
* Session-header entry point for the unified operations view. Sections
* collapse when their domain has nothing to show.
* @param props - runtime slot currency, translator, and injected API.
* @returns the trigger button and its popover.
*/
function OperationsAction({ sessionId, useSessions, useProjection, t, api, refreshSubagents, openChild }) {
	const useSessionsTyped = useSessions;
	const jobs = useSessionsTyped((state) => state.jobsBySession[sessionId]) ?? NO_JOBS;
	const catalog = useSessionsTyped((state) => state.subagentsByParent[sessionId]);
	const waits = useProjection("goodjob/waits")?.waits ?? [];
	const [open, setOpen] = (0, react.useState)(false);
	const [now, setNow] = (0, react.useState)(() => Date.now());
	const [expandedJob, setExpandedJob] = (0, react.useState)();
	const [jobOutput, setJobOutput] = (0, react.useState)();
	const rootRef = (0, react.useRef)(null);
	const liveJobs = (0, react.useMemo)(() => jobs.filter(isLive).length, [jobs]);
	const agents = (0, react.useMemo)(() => (catalog?.entries ?? []).map(toAgentRow).filter((row) => row !== void 0), [catalog]);
	(0, react.useEffect)(() => {
		if (open) refreshSubagents(sessionId);
	}, [
		open,
		sessionId,
		refreshSubagents
	]);
	(0, react.useEffect)(() => {
		if (!open || liveJobs === 0) return;
		setNow(Date.now());
		const timer = setInterval(() => {
			setNow(Date.now());
		}, 1e3);
		return () => {
			clearInterval(timer);
		};
	}, [open, liveJobs]);
	(0, react.useEffect)(() => {
		if (expandedJob === void 0) return;
		if (!jobs.some((job) => job.id === expandedJob)) setExpandedJob(void 0);
	}, [jobs, expandedJob]);
	(0, react.useEffect)(() => {
		if (expandedJob === void 0) {
			setJobOutput(void 0);
			return;
		}
		let cancelled = false;
		api.jobs.observe({
			sessionId,
			jobId: expandedJob,
			afterSequence: 0
		}).then((response) => {
			if (cancelled || !response.result.ok) return;
			setJobOutput(renderObserve(response.result.value));
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [
		api,
		sessionId,
		expandedJob
	]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: css.root,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: css.trigger,
			"aria-expanded": open,
			"aria-label": t("title"),
			onClick: () => {
				setOpen((current) => !current);
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.triggerName,
				children: "GoodJob"
			}), liveJobs > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.liveCount,
				children: liveJobs
			}) : null]
		}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: css.menu,
			role: "dialog",
			"aria-label": t("title"),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: css.heading,
					children: t("section.agents")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentsList, {
					sessionId: String(sessionId),
					agents,
					subagentsApi: api.subagents,
					t,
					onOpen: (childSessionId) => openChild({
						parentSessionId: sessionId,
						childSessionId,
						mode: "continuable"
					})
				})] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: css.heading,
					children: t("section.jobs")
				}), jobs.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: css.empty,
					children: t("jobs.empty")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: css.jobs,
					"aria-label": t("section.jobs"),
					children: jobs.map((job) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: css.jobRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${css.jobStatus} ${isLive(job) ? css.jobLive : ""}`,
								children: isLive(job) ? t("status.running") : job.status
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: css.jobLabel,
								title: job.label,
								children: [
									job.kind,
									": ",
									job.label
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: css.jobDuration,
								children: [Math.max(0, Math.round(((job.finishedAt ?? now) - job.startedAt) / 1e3)), "s"]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: css.action,
								onClick: () => {
									setExpandedJob((current) => current === job.id ? void 0 : job.id);
								},
								children: t("jobs.logs")
							}),
							expandedJob === job.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: css.output,
								children: jobOutput ?? ""
							}) : null
						]
					}, job.id))
				})] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: css.heading,
					children: t("section.waits")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WaitsList, {
					waits,
					t
				})] })
			]
		}) : null]
	});
}
/** Join one observation page's chunks in sequence order. */
function renderObserve(value) {
	return value.chunks.map((chunk) => chunk.text).join("");
}
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
	["autoFollowOutput", "Auto-follow job output"]
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
					autoFollowOutput: value?.autoFollowOutput ?? true
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
* Client plugin body: register the dictionaries, the header action, and the
* settings card keyed by the `goodjob` namespace.
* @param ctx - client root context.
* @param config - host-side config echoed through the client graph.
*/
function apply(ctx, config = {}) {
	config.showJobs ?? DEFAULTS.showJobs, config.showWaits ?? DEFAULTS.showWaits, config.showSubagents ?? DEFAULTS.showSubagents, config.autoFollowOutput ?? DEFAULTS.autoFollowOutput;
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
	ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
		name: "conversation.session.header.actions",
		id: "goodjob-operations",
		order: 30,
		locale: NS,
		inject: () => ({
			api: ctx.get("connection").api,
			refreshSubagents: (parentSessionId) => sessionsFace(ctx).refreshSubagents(parentSessionId),
			openChild: (address) => sessionsFace(ctx).openSubagent(address)
		})
	}, OperationsAction));
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