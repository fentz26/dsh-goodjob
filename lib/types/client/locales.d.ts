/**
 * GoodJob locale dictionaries. Product copy is Chinese-first with the English
 * pair beside it; keys are flat strings matching the client locale contract.
 * @module dsh-goodjob/client/locales
 */
/** Locale namespace owned by the operations view. */
export declare const NS: "goodjob";
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** GoodJob operations and settings copy. */
        'goodjob': Key;
    }
}
/** Dictionary key union for the `goodjob` namespace. */
export type Key = 'title' | 'section.agents' | 'section.jobs' | 'section.waits' | 'agents.empty' | 'agents.currentTask' | 'agents.lastActivity' | 'agents.elapsed' | 'agents.open' | 'agents.message' | 'agents.interrupt' | 'agents.messagePlaceholder' | 'agents.send' | 'agents.interruptConfirm' | 'jobs.empty' | 'jobs.owner' | 'jobs.logs' | 'waits.empty' | 'waits.mode.any' | 'waits.mode.all' | 'waits.status.pending' | 'waits.status.ready' | 'waits.status.dispatched' | 'waits.status.cancelled' | 'status.running' | 'status.idle' | 'status.inactive' | 'common.close';
/** Chinese product copy. */
export declare const zh: Record<Key, string>;
/** English copy. */
export declare const en: Record<Key, string>;
