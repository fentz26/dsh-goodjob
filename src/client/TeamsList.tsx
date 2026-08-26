/** Optional Agent Teams roster, task, mailbox, and Lead-authorized controls. */
import { useState } from 'react'
import type {
  GoodJobRuntimeTeamMember,
  GoodJobRuntimeTeamTask,
  GoodJobTeamMessageView,
} from '../types.ts'
import { css } from './styles.ts'

/** GoodJob loopback RPC caller used by Team controls. */
export interface GoodJobRpc {
  call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{
    ok: true
    value: unknown
  } | {
    ok: false
    error: { message: string }
  }>
}

/** Props for the optional Team section. */
export interface TeamsListProps {
  sessionId: string
  members: readonly GoodJobRuntimeTeamMember[]
  tasks: readonly GoodJobRuntimeTeamTask[]
  messages: readonly GoodJobTeamMessageView[]
  showTasks: boolean
  showMailbox: boolean
  rpc: GoodJobRpc
  onOpen(member: GoodJobRuntimeTeamMember): void
  onChanged(): void
}

/** Render the live Team adapter and durable mailbox. */
export function TeamsList(props: TeamsListProps) {
  const { sessionId, members, tasks, messages, showTasks, showMailbox, rpc, onOpen, onChanged } = props
  const [target, setTarget] = useState<string>()
  const [draft, setDraft] = useState('')
  const [delivery, setDelivery] = useState<'quiet' | 'wakeup'>('quiet')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const invoke = async (endpoint: string, payload: Record<string, unknown>): Promise<boolean> => {
    setBusy(true)
    setError(undefined)
    try {
      const result = await rpc.call('/goodjob', endpoint, { sessionId, ...payload })
      if (!result.ok) {
        setError(result.error.message)
        return false
      }
      onChanged()
      return true
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <ul className={css.teams} aria-label="Team members">
        {members.map(member => (
          <li key={member.id} className={css.teamRow}>
            <span className={`${css.agentDot} ${member.status === 'running' ? css.agentRunning : ''}`} />
            <span className={css.agentLabel}>{member.name}</span>
            <span className={css.agentMode}>{member.role} · {member.status}{member.model === undefined ? '' : ` · ${member.model}`}</span>
            <span className={css.agentActions}>
              {member.role === 'teammate' ? (
                <>
                  <button type="button" className={css.action} onClick={() => { onOpen(member) }}>Open</button>
                  <button type="button" className={css.action} onClick={() => { setTarget(member.name) }}>Message</button>
                  <button
                    type="button"
                    className={css.action}
                    disabled={busy || member.status === 'inactive'}
                    onClick={() => { void invoke('team.interrupt', { target: member.name }) }}
                  >Interrupt</button>
                </>
              ) : null}
            </span>
            {target === member.name ? (
              <div className={css.composer}>
                <textarea className={css.composerInput} rows={2} value={draft} onChange={event => { setDraft(event.target.value) }} />
                <div className={css.composerRow}>
                  <select value={delivery} onChange={event => { setDelivery(event.target.value as 'quiet' | 'wakeup') }}>
                    <option value="quiet">Quiet</option>
                    <option value="wakeup">Wake</option>
                  </select>
                  <button type="button" className={css.action} onClick={() => { setTarget(undefined) }}>Close</button>
                  <button
                    type="button"
                    className={`${css.action} ${css.primary}`}
                    disabled={busy || draft.trim().length === 0}
                    onClick={() => {
                      void invoke('team.message', { target: member.name, delivery, text: draft }).then((sent) => {
                        if (sent) { setDraft(''); setTarget(undefined) }
                      })
                    }}
                  >Send</button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {showTasks && tasks.length > 0 ? (
        <ul className={css.teamTasks} aria-label="Team tasks">
          {tasks.map(task => (
            <li key={task.id} className={css.teamTask}>
              <span>{task.status}</span>
              <span className={css.jobLabel}>{task.subject}</span>
              <select
                aria-label={`Reassign ${task.subject}`}
                value={task.ownerName ?? ''}
                disabled={busy || task.status === 'completed' || task.status === 'deleted'}
                onChange={(event) => {
                  void invoke('team.reassign', {
                    taskId: task.id,
                    expectedRevision: task.revision,
                    owner: event.target.value,
                  })
                }}
              >
                <option value="">Unassigned</option>
                {members.map(member => <option key={member.id} value={member.name}>{member.name}</option>)}
              </select>
            </li>
          ))}
        </ul>
      ) : null}
      {showMailbox && messages.length > 0 ? (
        <ul className={css.mailbox} aria-label="Team mailbox">
          {messages.map(message => (
            <li key={message.id}><strong>{message.senderName}</strong> → {message.targetId}: {message.text} ({message.delivered ? 'delivered' : 'queued'})</li>
          ))}
        </ul>
      ) : null}
      {error === undefined ? null : <p className={css.error}>{error}</p>}
    </div>
  )
}
