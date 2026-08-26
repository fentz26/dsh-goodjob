/**
 * GoodJob locale dictionaries. Product copy is Chinese-first with the English
 * pair beside it; keys are flat strings matching the client locale contract.
 * @module dsh-goodjob/client/locales
 */

import type {} from '@deepseek-ai/dsh-client-ui-slots'

/** Locale namespace owned by the operations view. */
export const NS = 'goodjob' as const

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** GoodJob operations and settings copy. */
    'goodjob': Key
  }
}

/** Dictionary key union for the `goodjob` namespace. */
export type Key =
  | 'title'
  | 'section.agents'
  | 'section.jobs'
  | 'section.waits'
  | 'agents.empty'
  | 'agents.currentTask'
  | 'agents.lastActivity'
  | 'agents.elapsed'
  | 'agents.open'
  | 'agents.message'
  | 'agents.interrupt'
  | 'agents.messagePlaceholder'
  | 'agents.send'
  | 'agents.interruptConfirm'
  | 'jobs.empty'
  | 'jobs.owner'
  | 'jobs.logs'
  | 'waits.empty'
  | 'waits.mode.any'
  | 'waits.mode.all'
  | 'waits.status.pending'
  | 'waits.status.ready'
  | 'waits.status.dispatched'
  | 'waits.status.cancelled'
  | 'status.running'
  | 'status.idle'
  | 'status.inactive'
  | 'common.close'

/** Chinese product copy. */
export const zh: Record<Key, string> = {
  'title': 'GoodJob 运维面板',
  'section.agents': '子代理',
  'section.jobs': '后台任务',
  'section.waits': '等待',
  'agents.empty': '此会话没有子代理。',
  'agents.currentTask': '当前任务',
  'agents.lastActivity': '最近活动',
  'agents.elapsed': '已用时',
  'agents.open': '打开',
  'agents.message': '消息',
  'agents.interrupt': '打断',
  'agents.messagePlaceholder': '向该代理追加一条提示…',
  'agents.send': '发送',
  'agents.interruptConfirm': '打断当前轮次？会话保持可继续。',
  'jobs.empty': '没有后台任务。',
  'jobs.owner': '所有者',
  'jobs.logs': '日志',
  'waits.empty': '没有等待中的条件。',
  'waits.mode.any': '任一',
  'waits.mode.all': '全部',
  'waits.status.pending': '等待中',
  'waits.status.ready': '就绪',
  'waits.status.dispatched': '已唤醒',
  'waits.status.cancelled': '已取消',
  'status.running': '运行中',
  'status.idle': '空闲',
  'status.inactive': '不活跃',
  'common.close': '关闭',
}

/** English copy. */
export const en: Record<Key, string> = {
  'title': 'GoodJob Operations',
  'section.agents': 'Subagents',
  'section.jobs': 'Jobs',
  'section.waits': 'Waits',
  'agents.empty': 'No subagents in this session.',
  'agents.currentTask': 'task',
  'agents.lastActivity': 'last activity',
  'agents.elapsed': 'elapsed',
  'agents.open': 'Open',
  'agents.message': 'Message',
  'agents.interrupt': 'Interrupt',
  'agents.messagePlaceholder': 'Send an additional prompt to this agent…',
  'agents.send': 'Send',
  'agents.interruptConfirm': 'Interrupt the current turn? The session stays continuable.',
  'jobs.empty': 'No background jobs.',
  'jobs.owner': 'owner',
  'jobs.logs': 'Logs',
  'waits.empty': 'Nothing being waited on.',
  'waits.mode.any': 'any',
  'waits.mode.all': 'all',
  'waits.status.pending': 'waiting',
  'waits.status.ready': 'ready',
  'waits.status.dispatched': 'resumed',
  'waits.status.cancelled': 'cancelled',
  'status.running': 'running',
  'status.idle': 'idle',
  'status.inactive': 'inactive',
  'common.close': 'Close',
}
