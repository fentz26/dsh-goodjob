/** Durable Job Groups rendered from the Session projection. */
import type { JobView } from '@deepseek-ai/dsh-client-connection/client';
import type { GoodJobGroupView } from '../types.ts';
/** Props for the Job Groups section. */
export interface GroupsListProps {
    groups: readonly GoodJobGroupView[];
    jobs: readonly JobView[];
    autoExpandActive: boolean;
    onLogs(jobId: JobView['id']): void;
}
/** Render exact member counts and authoritative Job states. */
export declare function GroupsList({ groups, jobs, autoExpandActive, onLogs }: GroupsListProps): import("react").JSX.Element;
