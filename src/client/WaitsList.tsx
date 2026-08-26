/**
 * Waits section: renders the `goodjob/waits` projection value.
 *
 * The component is a pure function of its props; the projection arrives
 * through the framework `useProjection` seat, so viewing a wait causes no
 * host work beyond the fold the owning event already paid for.
 * @module dsh-goodjob/client/WaitsList
 */
import type { GoodJobWaitView } from '../types.ts'
import { NS } from './locales.ts'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { css } from './styles.ts'

/** Props for {@link WaitsList}. */
export interface WaitsListProps {
  /** Folded wait views in creation order. */
  waits: readonly GoodJobWaitView[]
  /** Namespace translator. */
  t: TranslateNS<typeof NS>
}

/** Human word for one folded lifecycle state. */
function statusKey(status: GoodJobWaitView['status']): `waits.status.${GoodJobWaitView['status']}` {
  return `waits.status.${status}`
}

/**
 * Render one leaf: settled leaves show their provider with a check, pending
 * ones an ellipsis. Leaf input stays inspectable through the title
 * attribute without growing the visible row.
 */
function Leaf({ leaf }: { leaf: GoodJobWaitView['leaves'][number] }) {
  return (
    <li className={leaf.result !== undefined ? css.leafDone : css.leaf}>
      <span className={css.leafMark}>{leaf.result !== undefined ? '✓' : '…'}</span>
      <span title={JSON.stringify(leaf.input) ?? ''}>{leaf.provider ?? `#${leaf.index}`}</span>
    </li>
  )
}

/**
 * Render the waits section body.
 * @param props - waits and translator.
 * @returns the list, or the empty line.
 */
export function WaitsList({ waits, t }: WaitsListProps) {
  if (waits.length === 0) return <p className={css.empty}>{t('waits.empty')}</p>
  return (
    <ul className={css.waits} aria-label={t('section.waits')}>
      {waits.map((wait) => (
        <li key={wait.id} className={css.waitRow} data-status={wait.status}>
          <span className={`${css.waitStatus} ${css[wait.status] ?? ''}`}>{t(statusKey(wait.status))}</span>
          <span className={css.waitMode}>{t(wait.mode === 'any' ? 'waits.mode.any' : 'waits.mode.all')}</span>
          <ul className={css.leaves}>
            {wait.leaves.map(leaf => <Leaf key={leaf.index} leaf={leaf} />)}
          </ul>
          {wait.winnerIndex !== undefined
            ? (
                <span className={css.winner}>
                  #{wait.winnerIndex}
                </span>
              )
            : null}
        </li>
      ))}
    </ul>
  )
}
