/** Durable Job Groups rendered from the Session projection. */
import type { JobView } from '@deepseek-ai/dsh-client-connection/client'
import type { GoodJobGroupView } from '../types.ts'
import { css } from './styles.ts'

/** Props for the Job Groups section. */
export interface GroupsListProps {
  groups: readonly GoodJobGroupView[]
  jobs: readonly JobView[]
  autoExpandActive: boolean
  onLogs(jobId: JobView['id']): void
}

/** Render exact member counts and authoritative Job states. */
export function GroupsList({ groups, jobs, autoExpandActive, onLogs }: GroupsListProps) {
  if (groups.length === 0) return <p className={css.empty}>No Job Groups in this session.</p>
  const byId = new Map(jobs.map(job => [String(job.id), job]))
  return (
    <ul className={css.groups} aria-label="Job Groups">
      {groups.map((group) => {
        const members = group.jobIds.map(id => byId.get(id))
        const settled = members.filter(job => job !== undefined && job.status !== 'running' && job.status !== 'stopping').length
        const active = members.some(job => job?.status === 'running' || job?.status === 'stopping')
        return (
          <li key={group.id} className={css.groupRow}>
            <details open={autoExpandActive && active}>
              <summary>
                <span className={css.groupLabel}>{group.label}</span>
                <span className={css.groupCount}>{settled}/{group.jobIds.length} settled</span>
              </summary>
              <ul className={css.groupMembers}>
                {group.jobIds.map((id, index) => {
                  const job = members[index]
                  return (
                    <li key={id} className={css.groupMember}>
                      <span>{job?.status ?? 'unavailable'}</span>
                      <span className={css.jobLabel}>{job?.label ?? id}</span>
                      {job === undefined ? null : (
                        <button type="button" className={css.action} onClick={() => { onLogs(job.id) }}>Logs</button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </details>
          </li>
        )
      })}
    </ul>
  )
}
