/**
 * The GoodJob settings card: the visibility toggles under
 * Settings → Plugins → GoodJob, keyed by the plugin's `goodjob` namespace.
 * The card stages edits locally, sends one revision-checked patch through the
 * existing settings API, and renders nothing while the namespace is absent.
 * Repository and version metadata live in the Plugin Inventory surface
 * instead of this form.
 * @module dsh-goodjob/client/SettingsCard
 */
import { useEffect, useState } from 'react'
import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { css } from './styles.ts'
import type { Config } from '../config-types.ts'

/** Props for {@link GoodJobSettingsCard}. */
export interface SettingsCardProps {
  /** Typed client API face (settings describe/update). */
  api: IApiClient
}

/** The boolean fields this card owns with host-mirrored defaults. */
const FIELDS = [
  ['showJobs', 'Jobs'],
  ['showSubagents', 'Agents'],
  ['showWaits', 'Waits'],
  ['showGroups', 'Job Groups'],
  ['autoExpandActiveGroups', 'Expand active groups'],
  ['showTeams', 'Agent Teams'],
  ['showTeamMailbox', 'Team mailbox'],
  ['showTeamTasks', 'Team tasks'],
  ['autoFollowOutput', 'Auto-follow job output'],
  ['restoreWorkspace', 'Restore open tabs and split layout'],
  ['showActivityFeed', 'Activity feed'],
  ['showGraph', 'Relationship graph'],
  ['showCompletedJobs', 'Completed Jobs in Explorer'],
  ['showCompletedTasks', 'Completed tasks in Explorer'],
] as const

/** One field's key in the GoodJob config. */
type FieldKey = (typeof FIELDS)[number][0]

/**
 * Render the GoodJob configuration card.
 * @param props - API access.
 * @returns the card body, or null before the namespace answers.
 */
export function GoodJobSettingsCard({ api }: SettingsCardProps) {
  const [current, setCurrent] = useState<Required<Config>>()
  const [writable, setWritable] = useState(false)
  const [revision, setRevision] = useState<number>()
  const [dirty, setDirty] = useState<Partial<Config>>({})

  useEffect(() => {
    let cancelled = false
    void api.settings.describe({})
      .then((response: Awaited<ReturnType<typeof api.settings.describe>>) => {
        if (cancelled || !response.result.ok) return
        const described = response.result.value
        setWritable(described.writable)
        const section = described.namespaces.find((ns: { ns: string }) => ns.ns === 'goodjob')
        if (section !== undefined) {
          setRevision(section.revision)
          const value = section.value as Partial<Config> | undefined
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
            maxRenderedOutputChars: value?.maxRenderedOutputChars ?? 200_000,
            outputObserveIntervalMs: value?.outputObserveIntervalMs ?? 1_000,
          })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [api])

  if (current === undefined) return null

  const save = (): void => {
    void api.settings.update({ ns: 'goodjob', patch: dirty, expectedRevision: revision })
    setCurrent({ ...current, ...dirty })
    setDirty({})
  }

  return (
    <div className={css.card}>
      <h3 className={css.heading}>GoodJob</h3>
      <p className={css.empty}>Background jobs, waits, and agent operations</p>
      {FIELDS.map(([field, label]) => (
        <label key={field} className={css.cardRow}>
          <input
            type="checkbox"
            checked={(dirty[field as FieldKey] ?? current[field]) === true}
            disabled={!writable}
            onChange={(event) => {
              setDirty(previous => ({ ...previous, [field]: event.target.checked }))
            }}
          />
          <span>{label}</span>
        </label>
      ))}
      {Object.keys(dirty).length > 0 && writable
        ? (
          <button type="button" className={`${css.action} ${css.primary}`} onClick={save}>
            Save
          </button>
          )
        : null}
    </div>
  )
}
