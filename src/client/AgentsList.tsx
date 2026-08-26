/**
 * Agents section: one row per direct subagent child of the current session.
 *
 * Data comes from the existing `subagentsByParent` catalog mirror; message
 * and interrupt go through the existing subagent RPCs, so no duplicate
 * conversation is created, delivery keeps the host's FIFO queueing, and
 * interruption only ends the current turn.
 * @module dsh-goodjob/client/AgentsList
 */
import { useState } from 'react'
import type { IApiClient, SessionId } from '@deepseek-ai/dsh-client-connection/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'
import { css } from './styles.ts'

/** One renderable catalog child. */
export interface AgentRow {
  /** Child session id. */
  id: string
  /** Catalog label; one-shots may be unlabeled. */
  label?: string
  /** Delivery mode; continuable children accept further prompts. */
  mode: 'one-shot' | 'continuable'
  /** Driver state at the last catalog refresh. */
  activity: 'running' | 'inactive'
}

/** Props for {@link AgentsList}. */
export interface AgentsListProps {
  /** Parent (current) session id used to address every child. */
  sessionId: string
  /** Catalog rows for the current session's direct children. */
  agents: readonly AgentRow[]
  /** Subagent control API. */
  subagentsApi: IApiClient['subagents']
  /** Open one child transcript in the existing conversation surface. */
  onOpen(childSessionId: string): void
  /** Namespace translator. */
  t: TranslateNS<typeof NS>
}

/**
 * Render the agents section body with per-row actions.
 * @param props - parent id, agents, API, translator.
 * @returns the list, or the empty line.
 */
export function AgentsList({ sessionId, agents, subagentsApi, onOpen, t }: AgentsListProps) {
  const [composingFor, setComposingFor] = useState<string>()
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  if (agents.length === 0) return <p className={css.empty}>{t('agents.empty')}</p>

  const send = async (childSessionId: string): Promise<void> => {
    if (draft.trim().length === 0) return
    setBusy(true)
    try {
      await subagentsApi.prompt({
        parentSessionId: sessionId as SessionId,
        childSessionId: childSessionId as SessionId,
        mode: 'continuable',
        content: [{ type: 'text', text: draft }],
      })
      setDraft('')
      setComposingFor(undefined)
    } finally {
      setBusy(false)
    }
  }

  const interrupt = async (childSessionId: string): Promise<void> => {
    if (!window.confirm(t('agents.interruptConfirm'))) return
    setBusy(true)
    try {
      await subagentsApi.interrupt({
        parentSessionId: sessionId as SessionId,
        childSessionId: childSessionId as SessionId,
        mode: 'continuable',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <ul className={css.agents} aria-label={t('section.agents')}>
      {agents.map((agent) => (
        <li key={agent.id} className={css.agentRow}>
          <span
            className={`${css.agentDot} ${agent.activity === 'running' ? css.agentRunning : ''}`}
            title={t(agent.activity === 'running' ? 'status.running' : 'status.inactive')}
          />
          <span className={css.agentLabel}>{agent.label ?? agent.id}</span>
          <span className={css.agentMode}>{agent.mode}</span>
          <span className={css.agentActions}>
            <button type="button" className={css.action} onClick={() => { onOpen(agent.id) }}>
              {t('agents.open')}
            </button>
            <button type="button" className={css.action} onClick={() => { setComposingFor(agent.id) }}>
              {t('agents.message')}
            </button>
            <button
              type="button"
              className={css.action}
              disabled={busy}
              onClick={() => { void interrupt(agent.id) }}
            >
              {t('agents.interrupt')}
            </button>
          </span>
          {composingFor === agent.id
            ? (
              <div className={css.composer}>
                <textarea
                  className={css.composerInput}
                  placeholder={t('agents.messagePlaceholder')}
                  value={draft}
                  rows={2}
                  onChange={(event) => { setDraft(event.target.value) }}
                />
                <div className={css.composerRow}>
                  <button type="button" className={css.action} onClick={() => { setComposingFor(undefined) }}>
                    {t('common.close')}
                  </button>
                  <button
                    type="button"
                    className={`${css.action} ${css.primary}`}
                    disabled={busy || draft.trim().length === 0}
                    onClick={() => { void send(agent.id) }}
                  >
                    {t('agents.send')}
                  </button>
                </div>
              </div>
              )
            : null}
        </li>
      ))}
    </ul>
  )
}

/** Narrow a raw catalog entry to the renderable child shape; diagnostics rows are skipped. */
export function toAgentRow(entry: unknown): AgentRow | undefined {
  if (typeof entry !== 'object' || entry === null) return undefined
  const candidate = entry as Record<string, unknown>
  if (candidate.kind !== 'child') return undefined
  if (candidate.mode !== 'one-shot' && candidate.mode !== 'continuable') return undefined
  if (candidate.activity !== 'running' && candidate.activity !== 'inactive') return undefined
  return {
    id: String(candidate.id),
    label: typeof candidate.label === 'string' ? candidate.label : undefined,
    mode: candidate.mode,
    activity: candidate.activity,
  }
}
