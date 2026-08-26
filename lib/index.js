import { Service } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import { z as z$1 } from "zod";
import { randomUUID } from "node:crypto";
import { JobId } from "@deepseek-ai/dsh-jobs";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { SessionId } from "@deepseek-ai/dsh-session";
//#region src/fold.ts
/** Stable empty list so an idle session keeps one array identity. */
const NO_WAITS = [];
/** Narrow one raw session-log record to the `wait/change` payload. */
function isWaitChange(value) {
	return typeof value === "object" && value !== null && value.type === "wait/change";
}
/**
* Apply one committed event to the previous waits view.
* @param state - previous client value (null before the first wait).
* @param event - one raw committed Session event.
* @returns the next value; the same reference when the event is not a wait mutation.
*/
function applyWaitEvent(state, event) {
	if (!isWaitChange(event) || event.version !== 1) return state;
	switch (event.operation) {
		case "create": {
			const leaves = event.wait.expression.conditions.map((condition, index) => ({
				index,
				provider: condition.provider,
				input: condition.input
			}));
			const view = {
				id: event.wait.id,
				sessionId: "",
				createdAt: event.wait.createdAt,
				mode: event.wait.expression.mode,
				leaves,
				status: "pending"
			};
			return { waits: [...(state?.waits ?? NO_WAITS).filter((existing) => existing.id !== view.id), view] };
		}
		case "resolve": return mapWait(state, event.id, (wait) => {
			if (wait.status === "cancelled") return wait;
			const leaves = wait.leaves.map((leaf) => leaf.index === event.result.index && leaf.result === void 0 ? {
				...leaf,
				result: event.result.value
			} : leaf);
			const status = (wait.mode === "any" ? true : leaves.every((leaf) => leaf.result !== void 0)) ? "ready" : wait.status;
			const winnerIndex = wait.mode === "any" ? wait.winnerIndex ?? event.result.index : void 0;
			return {
				...wait,
				leaves,
				status,
				winnerIndex
			};
		});
		case "cancel": return mapWait(state, event.id, (wait) => wait.status === "dispatched" ? wait : {
			...wait,
			status: "cancelled"
		});
		case "dispatch": {
			const ids = new Set(event.ids);
			let changed = false;
			const waits = (state?.waits ?? NO_WAITS).map((wait) => {
				if (!ids.has(wait.id)) return wait;
				changed = true;
				return {
					...wait,
					status: "dispatched"
				};
			});
			return changed ? { waits } : state;
		}
	}
}
/** Rewrite one wait by id, keeping references for untouched members. */
function mapWait(state, id, rewrite) {
	const waits = state?.waits ?? NO_WAITS;
	let changed = false;
	const next = waits.map((wait) => {
		if (wait.id !== id) return wait;
		changed = true;
		return rewrite(wait);
	});
	return changed ? { waits: next } : state;
}
//#endregion
//#region src/groups.ts
/** Durable GoodJob Job Groups and their compact model-facing tool. */
/** Stable empty projection used before the first group mutation. */
const NO_GROUPS = { groups: [] };
/** Error raised when GoodJob's durable group history is inconsistent. */
var GoodJobGroupLogError = class extends Error {
	constructor(message) {
		super(`corrupt GoodJob group log: ${message}`);
		this.name = "GoodJobGroupLogError";
	}
};
/** Brand one validated group identity. */
function groupId(value) {
	return value;
}
function record(value, label) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new GoodJobGroupLogError(`${label} must be an object`);
	return value;
}
function text(value, label) {
	if (typeof value !== "string" || value.trim().length === 0) throw new GoodJobGroupLogError(`${label} must be a non-empty string`);
	return value;
}
function nonNegativeInteger(value, label) {
	if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new GoodJobGroupLogError(`${label} must be a non-negative safe integer`);
	return value;
}
function positiveInteger(value, label) {
	const parsed = nonNegativeInteger(value, label);
	if (parsed === 0) throw new GoodJobGroupLogError(`${label} must be positive`);
	return parsed;
}
function jobIds(value, label) {
	if (!Array.isArray(value) || value.length === 0) throw new GoodJobGroupLogError(`${label} must be a non-empty array`);
	const ids = value.map((id, index) => text(id, `${label}[${index}]`));
	if (new Set(ids).size !== ids.length) throw new GoodJobGroupLogError(`${label} must be unique`);
	return ids;
}
function parseGroup(value) {
	const group = record(value, "group");
	return {
		id: groupId(text(group.id, "group.id")),
		ownerSessionId: text(group.ownerSessionId, "group.ownerSessionId"),
		revision: positiveInteger(group.revision, "group.revision"),
		label: text(group.label, "group.label"),
		jobIds: jobIds(group.jobIds, "group.jobIds"),
		createdAt: nonNegativeInteger(group.createdAt, "group.createdAt")
	};
}
/** Decode one current-version group mutation after its event type is known. */
function parseChange(value) {
	const change = record(value, "change");
	if (change.version !== 1) throw new GoodJobGroupLogError(`unsupported version ${String(change.version)}`);
	if (change.operation === "create" || change.operation === "update") return {
		version: 1,
		operation: change.operation,
		group: parseGroup(change.group)
	};
	if (change.operation === "delete") return {
		version: 1,
		operation: "delete",
		id: groupId(text(change.id, "delete.id")),
		ownerSessionId: text(change.ownerSessionId, "delete.ownerSessionId"),
		expectedRevision: positiveInteger(change.expectedRevision, "delete.expectedRevision"),
		deletedAt: nonNegativeInteger(change.deletedAt, "delete.deletedAt")
	};
	throw new GoodJobGroupLogError(`unsupported operation ${String(change.operation)}`);
}
/** Apply one current-version group mutation to a projection. */
function applyGroupEvent(state, event) {
	if (typeof event !== "object" || event === null || event.type !== "goodjob/group-change") return state;
	const data = event.data;
	if (typeof data !== "object" || data === null || data.version !== 1) return state;
	const change = parseChange(data);
	const groups = [...state?.groups ?? NO_GROUPS.groups];
	const index = groups.findIndex((group) => group.id === (change.operation === "delete" ? change.id : change.group.id));
	if (change.operation === "create") {
		if (index !== -1) throw new GoodJobGroupLogError(`group ${change.group.id} was reused`);
		if (change.group.revision !== 1) throw new GoodJobGroupLogError(`group ${change.group.id} must begin at revision 1`);
		return { groups: [...groups, change.group] };
	}
	if (index === -1) {
		const id = change.operation === "delete" ? change.id : change.group.id;
		throw new GoodJobGroupLogError(`${change.operation} references unknown group ${id}`);
	}
	const current = groups[index];
	if (change.operation === "update") {
		if (change.group.ownerSessionId !== current.ownerSessionId || change.group.createdAt !== current.createdAt || change.group.revision !== current.revision + 1) throw new GoodJobGroupLogError(`group ${current.id} update changed identity or skipped a revision`);
		groups[index] = change.group;
		return { groups };
	}
	if (change.ownerSessionId !== current.ownerSessionId || change.expectedRevision !== current.revision) throw new GoodJobGroupLogError(`group ${current.id} delete used stale identity or revision`);
	groups.splice(index, 1);
	return { groups };
}
/** Replay current-version groups after the fork seed. */
function foldGroups(events, seedLength = 0) {
	let state = null;
	for (const event of events.slice(seedLength)) {
		if (event.type === "goodjob/group-change" && event.data.version !== 1) throw new GoodJobGroupLogError(`unsupported version ${String(event.data.version)}`);
		state = applyGroupEvent(state, event);
	}
	return [...state?.groups ?? []];
}
function requireAgent(agent) {
	if (agent === void 0) throw new Error("job_group requires an Agent-owned tool call");
	return agent;
}
function requiredArg(value, label) {
	if (value === void 0 || value.trim().length === 0) throw new Error(`${label} is required`);
	return value;
}
function requestedJobIds(value) {
	if (value === void 0 || value.length === 0) throw new Error("job_ids must contain at least one Job id");
	const ids = value.map((id, index) => requiredArg(id, `job_ids[${index}]`));
	if (new Set(ids).size !== ids.length) throw new Error("job_ids must be unique");
	return ids;
}
function findGroup(agent, rawId) {
	const id = groupId(requiredArg(rawId, "group_id"));
	const group = foldGroups(agent.session.events, agent.session.header.seedLength ?? 0).find((candidate) => candidate.id === id);
	if (group === void 0) throw new Error(`GoodJob group ${id} not found in this Session`);
	return group;
}
function assertJobs(ctx, agent, ids) {
	const jobs = ctx.get("jobs");
	if (jobs === void 0) throw new Error("job_group requires @deepseek-ai/dsh-jobs");
	for (const id of ids) jobs.get(JobId(id), agent);
}
async function appendChange(ctx, agent, change) {
	agent.session.append("goodjob/group-change", change, { ignorable: true });
	const sessions = ctx.get("sessions");
	if (sessions === void 0) throw new Error("job_group requires @deepseek-ai/dsh-session");
	await sessions.flush(agent.session);
}
function renderResult(result) {
	if (result.waitId !== void 0) return `created ${result.waitId} over group ${result.group?.id ?? ""}`;
	if (result.group !== void 0) return `${result.group.id} r${result.group.revision} ${result.group.label}: ${result.group.jobIds.join(", ")}`;
	return result.groups.length === 0 ? "(no GoodJob groups)" : result.groups.map((group) => `${group.id} r${group.revision} ${group.label}: ${group.jobIds.join(", ")}`).join("\n");
}
function jsonResult(result) {
	return result;
}
/** Register GoodJob's single group-management and group-wait tool. */
function registerGroupTool(ctx) {
	const tools = ctx.get("tools");
	if (tools === void 0) throw new Error("job_group requires @deepseek-ai/dsh-tools");
	return tools.register(defineTool({
		name: "job_group",
		description: "Create and edit durable logical groups of existing background Jobs, list them, or create one event-driven any/all wait over a group. Groups never start, stop, or own Jobs.",
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: [
					"create",
					"add",
					"remove",
					"rename",
					"delete",
					"list",
					"wait"
				]
			},
			group_id: {
				type: "string",
				description: "Group id returned by create/list; required except for create and list."
			},
			label: {
				type: "string",
				description: "Non-empty group label for create or rename."
			},
			job_ids: {
				type: "array",
				items: { type: "string" },
				description: "Existing Job ids for create, add, or remove."
			},
			mode: {
				type: "string",
				enum: ["any", "all"],
				description: "Existing wait expression mode for the wait action."
			}
		},
		output: {
			schema: { type: "json" },
			render: (_args, value) => [{
				type: "text",
				text: renderResult(value)
			}]
		},
		async execute(args, exec) {
			const agent = requireAgent(exec.agent);
			if (args.action === "list") return jsonResult({
				action: args.action,
				groups: foldGroups(agent.session.events, agent.session.header.seedLength ?? 0)
			});
			if (args.action === "create") {
				const ids = requestedJobIds(args.job_ids);
				assertJobs(ctx, agent, ids);
				const group = {
					id: groupId(`group-${randomUUID()}`),
					ownerSessionId: agent.id,
					revision: 1,
					label: requiredArg(args.label, "label"),
					jobIds: ids,
					createdAt: Date.now()
				};
				await appendChange(ctx, agent, {
					version: 1,
					operation: "create",
					group
				});
				return jsonResult({
					action: args.action,
					group,
					groups: [group]
				});
			}
			const current = findGroup(agent, args.group_id);
			if (args.action === "wait") {
				const waits = ctx.get("waits");
				if (waits === void 0) throw new Error("job_group wait requires @deepseek-ai/dsh-wait");
				const mode = args.mode ?? "all";
				const wait = await waits.create(agent, {
					mode,
					conditions: current.jobIds.map((id) => ({
						provider: "job",
						input: { job_id: id }
					}))
				});
				return jsonResult({
					action: args.action,
					group: current,
					groups: [current],
					waitId: wait.id
				});
			}
			if (args.action === "delete") {
				await appendChange(ctx, agent, {
					version: 1,
					operation: "delete",
					id: current.id,
					ownerSessionId: current.ownerSessionId,
					expectedRevision: current.revision,
					deletedAt: Date.now()
				});
				return jsonResult({
					action: args.action,
					groups: []
				});
			}
			let next;
			if (args.action === "rename") next = {
				...current,
				revision: current.revision + 1,
				label: requiredArg(args.label, "label")
			};
			else {
				const ids = requestedJobIds(args.job_ids);
				if (args.action === "add") {
					assertJobs(ctx, agent, ids);
					const additions = ids.filter((id) => !current.jobIds.includes(id));
					if (additions.length === 0) return jsonResult({
						action: args.action,
						group: current,
						groups: [current]
					});
					next = {
						...current,
						revision: current.revision + 1,
						jobIds: [...current.jobIds, ...additions]
					};
				} else {
					const retained = current.jobIds.filter((id) => !ids.includes(id));
					if (retained.length === current.jobIds.length) return jsonResult({
						action: args.action,
						group: current,
						groups: [current]
					});
					if (retained.length === 0) throw new Error("a GoodJob group must retain at least one Job");
					next = {
						...current,
						revision: current.revision + 1,
						jobIds: retained
					};
				}
			}
			await appendChange(ctx, agent, {
				version: 1,
				operation: "update",
				group: next
			});
			return jsonResult({
				action: args.action,
				group: next,
				groups: [next]
			});
		},
		presentCall: (args) => ({
			card: "generic",
			title: `GoodJob group: ${args.action}`,
			kind: args.action === "list" ? "read" : "execute",
			...args.group_id === void 0 ? {} : { rawInput: args.group_id }
		})
	}));
}
//#endregion
//#region src/rpc.ts
/** Logical Connection channel owned by GoodJob. */
const GOODJOB_RPC_CHANNEL = "/goodjob";
const sessionRequest = z$1.object({ sessionId: z$1.string().min(1) }).strict();
const messageRequest = z$1.object({
	sessionId: z$1.string().min(1),
	target: z$1.string().min(1),
	delivery: z$1.enum(["quiet", "wakeup"]),
	text: z$1.string().min(1).max(65e3)
}).strict();
const interruptRequest = z$1.object({
	sessionId: z$1.string().min(1),
	target: z$1.string().min(1)
}).strict();
const reassignRequest = z$1.object({
	sessionId: z$1.string().min(1),
	taskId: z$1.string().min(1),
	expectedRevision: z$1.number().int().positive(),
	owner: z$1.string()
}).strict();
function ok(value) {
	return {
		ok: true,
		value
	};
}
function badRequest(message) {
	return {
		ok: false,
		error: {
			code: "bad-request",
			message,
			details: { issues: [] }
		}
	};
}
function internal(message) {
	return {
		ok: false,
		error: {
			code: "internal",
			message,
			details: {}
		}
	};
}
function service(ctx, name) {
	return ctx.get(name);
}
function lead(ctx, sessionId) {
	return service(ctx, "agents")?.get(SessionId(sessionId));
}
function team(ctx) {
	return service(ctx, "agentTeams");
}
async function descendants(ctx, sessionId, signal) {
	const subagents = service(ctx, "subagents");
	if (subagents === void 0) return [];
	const rows = await subagents.listDescendants(SessionId(sessionId), signal);
	const agents = service(ctx, "agents");
	const jobs = service(ctx, "jobs");
	return rows.flatMap((row) => {
		if (typeof row !== "object" || row === null) return [];
		const value = row;
		if (typeof value.id !== "string" || typeof value.parentId !== "string" || typeof value.depth !== "number" || value.kind !== "child" && value.kind !== "diagnostic") return [];
		const live = agents?.get(SessionId(value.id));
		const relatedJobIds = live === void 0 || jobs === void 0 ? [] : jobs.list(live).filter((job) => job.ownerSession === live.id).map((job) => job.id);
		return [{
			id: value.id,
			parentId: value.parentId,
			depth: value.depth,
			kind: value.kind,
			...value.mode === "one-shot" || value.mode === "continuable" ? { mode: value.mode } : {},
			...typeof value.label === "string" ? { label: value.label } : {},
			...value.activity === "running" || value.activity === "inactive" ? { activity: value.activity } : {},
			...typeof value.hasChildren === "boolean" ? { hasChildren: value.hasChildren } : {},
			...value.reason === "corrupt" || value.reason === "unsupported" || value.reason === "unavailable" ? { reason: value.reason } : {},
			...typeof live?.options.model === "string" ? { model: live.options.model } : {},
			relatedJobIds
		}];
	});
}
async function describe(ctx, payload, signal) {
	const parsed = sessionRequest.safeParse(payload);
	if (!parsed.success) return badRequest("operations.describe requires a non-empty sessionId");
	const members = team(ctx);
	const root = lead(ctx, parsed.data.sessionId);
	let runtimeMembers = [];
	let tasks = [];
	if (members !== void 0 && root !== void 0) try {
		runtimeMembers = members.listMembers(root);
		tasks = members.listTasks(root);
	} catch {}
	return ok({
		descendants: await descendants(ctx, parsed.data.sessionId, signal),
		team: {
			available: members !== void 0,
			live: members !== void 0 && root !== void 0,
			members: runtimeMembers,
			tasks
		}
	});
}
async function message(ctx, payload, signal) {
	const parsed = messageRequest.safeParse(payload);
	if (!parsed.success) return badRequest("team.message requires sessionId, target, delivery, and non-empty text");
	const teams = team(ctx);
	const root = lead(ctx, parsed.data.sessionId);
	if (teams === void 0) return internal("Agent Teams is not composed");
	if (root === void 0) return internal(`Team Lead session "${parsed.data.sessionId}" is not live`);
	return ok(await teams.sendMessage(root, {
		target: parsed.data.target,
		delivery: parsed.data.delivery,
		signal,
		content: [{
			type: "text",
			text: `Human via GoodJob, authorized as Team Lead:\n\n${parsed.data.text}`
		}]
	}));
}
async function interrupt(ctx, payload) {
	const parsed = interruptRequest.safeParse(payload);
	if (!parsed.success) return badRequest("team.interrupt requires sessionId and target");
	const teams = team(ctx);
	const root = lead(ctx, parsed.data.sessionId);
	if (teams === void 0) return internal("Agent Teams is not composed");
	if (root === void 0) return internal(`Team Lead session "${parsed.data.sessionId}" is not live`);
	return ok(teams.interrupt(root, parsed.data.target));
}
async function reassign(ctx, payload) {
	const parsed = reassignRequest.safeParse(payload);
	if (!parsed.success) return badRequest("team.reassign requires sessionId, taskId, expectedRevision, and owner");
	const teams = team(ctx);
	const root = lead(ctx, parsed.data.sessionId);
	if (teams === void 0) return internal("Agent Teams is not composed");
	if (root === void 0) return internal(`Team Lead session "${parsed.data.sessionId}" is not live`);
	return ok(await teams.updateTask(root, {
		taskId: parsed.data.taskId,
		expectedRevision: parsed.data.expectedRevision,
		action: "reassign",
		owner: parsed.data.owner
	}));
}
/** Register the loopback-only RPC endpoints used by GoodJob's browser half. */
function registerGoodJobRpc(ctx) {
	const connection = service(ctx, "connection");
	if (connection === void 0) throw new Error("GoodJob RPC requires the Host Connection service");
	return connection.rpc.handle(GOODJOB_RPC_CHANNEL, async (endpoint, payload, signal) => {
		try {
			switch (endpoint) {
				case "operations.describe": return await describe(ctx, payload, signal);
				case "team.message": return await message(ctx, payload, signal);
				case "team.interrupt": return await interrupt(ctx, payload);
				case "team.reassign": return await reassign(ctx, payload);
				default: return badRequest(`unknown GoodJob endpoint ${JSON.stringify(endpoint)}`);
			}
		} catch (error) {
			return internal(error instanceof Error ? error.message : String(error));
		}
	}, { authority: "loopback" });
}
//#endregion
//#region src/teams.ts
/** Stable empty Team projection. */
const NO_TEAMS = { teams: [] };
function rawRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function rawString(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function textContent(value) {
	if (!Array.isArray(value)) return "";
	return value.flatMap((block) => {
		const record = rawRecord(block);
		return record?.type === "text" && typeof record.text === "string" ? [record.text] : [];
	}).join("\n");
}
function teamAt(state, teamId) {
	return state?.teams.find((team) => team.teamId === teamId) ?? {
		teamId,
		members: [],
		tasks: [],
		messages: []
	};
}
function replaceTeam(state, team) {
	const teams = [...state?.teams ?? NO_TEAMS.teams];
	const index = teams.findIndex((candidate) => candidate.teamId === team.teamId);
	if (index === -1) teams.push(team);
	else teams[index] = team;
	return { teams };
}
function memberView(value) {
	const member = rawRecord(value);
	const id = rawString(member?.id);
	const name = rawString(member?.name);
	const description = rawString(member?.description);
	const provider = rawString(member?.provider);
	if (id === void 0 || name === void 0 || description === void 0 || provider === void 0 || member?.context !== "fresh" && member?.context !== "fork" || member?.phase !== "provisioning" && member?.phase !== "active" && member?.phase !== "failed") return void 0;
	return {
		id,
		name,
		description,
		provider,
		context: member.context,
		phase: member.phase,
		...typeof member.error === "string" ? { error: member.error } : {}
	};
}
function taskView(value) {
	const task = rawRecord(value);
	const id = rawString(task?.id);
	const subject = rawString(task?.subject);
	if (id === void 0 || subject === void 0 || typeof task?.description !== "string" || typeof task.revision !== "number" || !Number.isSafeInteger(task.revision) || task.revision < 1 || task.status !== "pending" && task.status !== "in_progress" && task.status !== "completed" && task.status !== "deleted" || !Array.isArray(task.blockedBy) || !task.blockedBy.every((item) => typeof item === "string") || !Array.isArray(task.writeScopes) || !task.writeScopes.every((item) => typeof item === "string")) return void 0;
	return {
		id,
		revision: task.revision,
		subject,
		description: task.description,
		status: task.status,
		...typeof task.ownerId === "string" ? { ownerId: task.ownerId } : {},
		blockedBy: task.blockedBy,
		writeScopes: task.writeScopes
	};
}
/** Apply one Team-owned Session event without importing the experimental package. */
function applyTeamEvent(state, event) {
	const envelope = rawRecord(event);
	if (envelope === void 0 || typeof envelope.type !== "string" || !envelope.type.startsWith("team/")) return state;
	const data = rawRecord(envelope.data);
	const teamId = rawString(data?.teamId);
	if (data?.version !== 1 || teamId === void 0) return state;
	const team = teamAt(state, teamId);
	if (envelope.type === "team/member") {
		const member = memberView(data.member);
		if (member === void 0) return state;
		return replaceTeam(state, {
			...team,
			members: [...team.members.filter((current) => current.id !== member.id), member]
		});
	}
	if (envelope.type === "team/task") {
		const task = taskView(data.task);
		if (task === void 0) return state;
		return replaceTeam(state, {
			...team,
			tasks: [...team.tasks.filter((current) => current.id !== task.id), task]
		});
	}
	if (envelope.type === "team/message/queued") {
		const message = rawRecord(data.message);
		const id = rawString(message?.id);
		const senderId = rawString(message?.senderId);
		const senderName = rawString(message?.senderName);
		const targetId = rawString(message?.targetId);
		if (id === void 0 || senderId === void 0 || senderName === void 0 || targetId === void 0 || message?.delivery !== "quiet" && message?.delivery !== "wakeup") return state;
		const view = {
			id,
			senderId,
			senderName,
			targetId,
			delivery: message.delivery,
			text: textContent(message.content),
			queuedAt: typeof envelope.time === "number" ? envelope.time : 0,
			delivered: false
		};
		return replaceTeam(state, {
			...team,
			messages: [...team.messages.filter((current) => current.id !== id), view]
		});
	}
	if (envelope.type === "team/message/delivered") {
		const messageId = rawString(data.messageId);
		if (messageId === void 0) return state;
		let changed = false;
		const messages = team.messages.map((message) => {
			if (message.id !== messageId || message.delivered) return message;
			changed = true;
			return {
				...message,
				delivered: true
			};
		});
		return changed ? replaceTeam(state, {
			...team,
			messages
		}) : state;
	}
	return state;
}
function completedTask(events, teamId, taskId) {
	let latest;
	for (const event of events) {
		const envelope = rawRecord(event);
		if (envelope?.type !== "team/task") continue;
		const data = rawRecord(envelope.data);
		if (data?.version !== 1 || data.teamId !== teamId) continue;
		const task = taskView(data.task);
		if (task?.id === taskId) latest = task;
	}
	return latest?.status === "completed" ? latest : void 0;
}
/** Register current-state Team task completion over durable Team snapshots. */
function registerTeamTaskWaitProvider(ctx) {
	const provider = {
		name: "team-task",
		description: "Agent Team task completion; input {\"task_id\":\"<id>\"}",
		resolve(input) {
			const taskId = rawString(rawRecord(input)?.task_id);
			if (taskId === void 0) throw new Error("team-task wait input requires a non-empty task_id");
			return { task_id: taskId };
		},
		bind({ agent, input, settle }) {
			const taskId = input.task_id;
			const check = () => {
				const task = completedTask(agent.session.events, agent.id, taskId);
				if (task !== void 0) settle({
					id: task.id,
					status: task.status,
					revision: task.revision
				});
			};
			const dispose = ctx.on("session/event", (session, event) => {
				if (session === agent.session && event.type === "team/task") check();
			});
			check();
			return dispose;
		}
	};
	const waits = ctx.get("waits");
	if (waits === void 0) throw new Error("team-task waits require @deepseek-ai/dsh-wait");
	return waits.registerProvider(provider);
}
//#endregion
//#region src/detect.ts
/**
* The DeepSeek Harness floor GoodJob is built against: a tree carrying
* `@deepseek-ai/dsh-wait` (the durable-agent-waits capability) and the
* non-consuming `jobs.observe` API. No released DSH version ships both yet;
* run from a source checkout of the deepseek-harness main branch that
* contains them.
*/
const REQUIRED_DSH_FLOOR = "deepseek-harness main with @deepseek-ai/dsh-wait and jobs.observe";
/**
* Read each seam through `ctx.get`, which returns undefined for absent
* services without topology sensitivity.
* @param ctx - host plugin context.
* @returns the detected seams.
*/
function detectSeams(ctx) {
	return {
		projections: ctx.get("sessionProjections"),
		settings: ctx.get("settings")
	};
}
/**
* Human diagnostics for the seams that were absent at load. A seam listed
* here may still appear later; {@link wireLate} attaches it when it does.
* @param detected - the detected seam set.
* @returns one line per absent seam, empty when everything resolved.
*/
function missingSeamDiagnostics(detected) {
	const lines = [];
	if (detected.projections === void 0) lines.push(`goodjob: sessionProjections not composed at load — wait state will not reach the web UI unless it mounts later. GoodJob requires ${REQUIRED_DSH_FLOOR}.`);
	if (detected.settings === void 0) lines.push(`goodjob: settings not composed at load — running without its configuration card unless it mounts later. GoodJob requires ${REQUIRED_DSH_FLOOR}.`);
	return lines;
}
//#endregion
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
//#region src/config.ts
/**
* GoodJob configuration schema: the validated face of {@link ./config-types.ts}
* for composition and the user settings document.
* @module dsh-goodjob/config
*/
/** The validated configuration schema. */
const ConfigSchema = z.object({
	showJobs: z.boolean().default(DEFAULTS.showJobs),
	showWaits: z.boolean().default(DEFAULTS.showWaits),
	showSubagents: z.boolean().default(DEFAULTS.showSubagents),
	showGroups: z.boolean().default(DEFAULTS.showGroups),
	autoExpandActiveGroups: z.boolean().default(DEFAULTS.autoExpandActiveGroups),
	showTeams: z.boolean().default(DEFAULTS.showTeams),
	showTeamMailbox: z.boolean().default(DEFAULTS.showTeamMailbox),
	showTeamTasks: z.boolean().default(DEFAULTS.showTeamTasks),
	autoFollowOutput: z.boolean().default(DEFAULTS.autoFollowOutput),
	restoreWorkspace: z.boolean().default(DEFAULTS.restoreWorkspace),
	showActivityFeed: z.boolean().default(DEFAULTS.showActivityFeed),
	showGraph: z.boolean().default(DEFAULTS.showGraph),
	showCompletedJobs: z.boolean().default(DEFAULTS.showCompletedJobs),
	showCompletedTasks: z.boolean().default(DEFAULTS.showCompletedTasks),
	maxRenderedOutputChars: z.number().min(1e4).max(1e6).default(DEFAULTS.maxRenderedOutputChars),
	outputObserveIntervalMs: z.number().min(250).max(1e4).default(DEFAULTS.outputObserveIntervalMs)
});
//#endregion
//#region src/index.ts
/**
* GoodJob host half: settings namespace, capability detection, and the
* GoodJob's durable projection and operations adapters.
*
* GoodJob owns no domain authority. Jobs reach the browser through the
* existing `jobsBySession` mirror and the non-consuming observe RPC;
* subagents through the subagent catalog and control RPCs; waits through this
* projection, which folds the `wait/change` events their owning package
* already logs. Unloading the plugin removes its registrations as effects of
* this service's fiber, so the projection key disappears from the feed
* without touching durable history.
* @module dsh-goodjob
*/
/** Bump when the fold changes shape; pure additions keep the version. */
const WAITS_STATE_VERSION = 1;
const GROUPS_STATE_VERSION = 1;
const TEAMS_STATE_VERSION = 1;
/** Wire schema validating the whole projection value on both sides. */
const goodJobWaitsSchema = z$1.union([z$1.object({ waits: z$1.array(z$1.object({
	id: z$1.string(),
	sessionId: z$1.string(),
	createdAt: z$1.number(),
	mode: z$1.union([z$1.literal("any"), z$1.literal("all")]),
	leaves: z$1.array(z$1.object({
		index: z$1.number().int().nonnegative(),
		provider: z$1.string().optional(),
		input: z$1.unknown().optional(),
		result: z$1.unknown().optional()
	})),
	status: z$1.union([
		z$1.literal("pending"),
		z$1.literal("ready"),
		z$1.literal("dispatched"),
		z$1.literal("cancelled")
	]),
	winnerIndex: z$1.number().int().nonnegative().optional()
})) }), z$1.null()]);
const groupSchema = z$1.object({
	id: z$1.string(),
	ownerSessionId: z$1.string(),
	revision: z$1.number().int().positive(),
	label: z$1.string(),
	jobIds: z$1.array(z$1.string()),
	createdAt: z$1.number().int().nonnegative()
});
const goodJobGroupsSchema = z$1.union([z$1.object({ groups: z$1.array(groupSchema) }), z$1.null()]);
const goodJobTeamsSchema = z$1.union([z$1.object({ teams: z$1.array(z$1.object({
	teamId: z$1.string(),
	members: z$1.array(z$1.object({
		id: z$1.string(),
		name: z$1.string(),
		description: z$1.string(),
		provider: z$1.string(),
		context: z$1.enum(["fresh", "fork"]),
		phase: z$1.enum([
			"provisioning",
			"active",
			"failed"
		]),
		error: z$1.string().optional()
	})),
	tasks: z$1.array(z$1.object({
		id: z$1.string(),
		revision: z$1.number().int().positive(),
		subject: z$1.string(),
		description: z$1.string(),
		status: z$1.enum([
			"pending",
			"in_progress",
			"completed",
			"deleted"
		]),
		ownerId: z$1.string().optional(),
		blockedBy: z$1.array(z$1.string()),
		writeScopes: z$1.array(z$1.string())
	})),
	messages: z$1.array(z$1.object({
		id: z$1.string(),
		senderId: z$1.string(),
		senderName: z$1.string(),
		targetId: z$1.string(),
		delivery: z$1.enum(["quiet", "wakeup"]),
		text: z$1.string(),
		queuedAt: z$1.number().int().nonnegative(),
		delivered: z$1.boolean()
	}))
})) }), z$1.null()]);
/**
* The GoodJob operations service. The class is the bundle row's mount point:
* it registers the settings namespace, detects capability seams with
* actionable diagnostics, and installs the waits projection wherever a
* session-projection registry is composed.
*/
var GoodJobService = class extends Service {
	static Config = ConfigSchema;
	/** Resolved configuration snapshot captured at load. */
	config;
	/**
	* Create the service. Schemastery validated and defaulted `config` before
	* construction.
	* @param ctx - Cordis context owning this fiber.
	* @param config - validated plugin configuration.
	*/
	constructor(ctx, config) {
		super(ctx, "goodjob");
		this.config = config;
		const detected = detectSeams(ctx);
		this.lateDisposers = /* @__PURE__ */ new Set();
		ctx.effect(() => async () => {
			await Promise.allSettled([...this.lateDisposers].map((dispose) => Promise.resolve(dispose())));
			this.lateDisposers.clear();
		}, "goodjob: seam teardown");
		this.attachSeams(detected);
		ctx.on("internal/service", (name, value) => {
			if (name === "settings" && this.settingsAttached === false) {
				this.settingsAttached = true;
				this.attachSettings(value);
			}
			if (name === "sessionProjections" && this.projectionsAttached === false) {
				this.projectionsAttached = true;
				this.attachProjections(value);
			}
			this.attachRuntimeAdapters();
		});
		this.attachRuntimeAdapters();
	}
	/** Whether each seam has been wired (immediately or late). */
	settingsAttached = false;
	projectionsAttached = false;
	groupToolAttached = false;
	teamTaskWaitAttached = false;
	rpcAttached = false;
	/** Disposers of seam registrations, drained by the seam-teardown effect. */
	lateDisposers;
	/**
	* Wire every seam present at construction and report the absent ones.
	* @param detected - seams resolved from the global store at load.
	*/
	attachSeams(detected) {
		for (const line of missingSeamDiagnostics(detected)) process.stderr.write(`${line}\n`);
		if (detected.settings !== void 0) this.attachSettings(detected.settings);
		if (detected.projections !== void 0) this.attachProjections(detected.projections);
	}
	/**
	* Register the settings namespace as an effect of this service's fiber.
	* @param settings - the settings registry seam.
	*/
	attachSettings(settings) {
		this.settingsAttached = true;
		this.lateDisposers.add(settings.register("goodjob", ConfigSchema));
	}
	/**
	* Install the waits projection. The registry keys its internal effect to
	* its own context, so GoodJob owns the returned disposer: unloading this
	* service unregisters the key even while the projection registry stays
	* mounted.
	* @param registry - the session-projection registry seam.
	*/
	attachProjections(registry) {
		this.projectionsAttached = true;
		this.lateDisposers.add(registry.register({
			key: "goodjob/waits",
			stateSchema: goodJobWaitsSchema,
			init: () => null,
			apply: (state, event) => applyWaitEvent(state, event),
			stateVersion: WAITS_STATE_VERSION,
			wire: {
				viewSchema: goodJobWaitsSchema,
				view: (state) => state
			}
		}));
		this.lateDisposers.add(registry.register({
			key: "goodjob/groups",
			stateSchema: goodJobGroupsSchema,
			init: () => null,
			apply: (state, event) => applyGroupEvent(state, event),
			stateVersion: GROUPS_STATE_VERSION,
			wire: {
				viewSchema: goodJobGroupsSchema,
				view: (state) => state
			}
		}));
		this.lateDisposers.add(registry.register({
			key: "goodjob/teams",
			stateSchema: goodJobTeamsSchema,
			init: () => null,
			apply: (state, event) => applyTeamEvent(state, event),
			stateVersion: TEAMS_STATE_VERSION,
			wire: {
				viewSchema: goodJobTeamsSchema,
				view: (state) => state
			}
		}));
	}
	/** Attach operational adapters once their owning services are composed. */
	attachRuntimeAdapters() {
		if (!this.groupToolAttached && this.ctx.get("tools") !== void 0 && this.ctx.get("jobs") !== void 0 && this.ctx.get("sessions") !== void 0) {
			this.groupToolAttached = true;
			this.lateDisposers.add(registerGroupTool(this.ctx));
		}
		if (!this.teamTaskWaitAttached && this.ctx.get("waits") !== void 0 && this.ctx.get("agentTeams") !== void 0) {
			this.teamTaskWaitAttached = true;
			this.lateDisposers.add(registerTeamTaskWaitProvider(this.ctx));
		}
		if (!this.rpcAttached && this.ctx.get("connection") !== void 0) {
			this.rpcAttached = true;
			this.lateDisposers.add(registerGoodJobRpc(this.ctx));
		}
	}
};
//#endregion
export { ConfigSchema, DEFAULTS, GoodJobService as default };

//# sourceMappingURL=index.js.map