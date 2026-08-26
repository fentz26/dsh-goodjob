/**
 * Waits section: renders the `goodjob/waits` projection value.
 *
 * The component is a pure function of its props; the projection arrives
 * through the framework `useProjection` seat, so viewing a wait causes no
 * host work beyond the fold the owning event already paid for.
 * @module dsh-goodjob/client/WaitsList
 */
import type { GoodJobWaitView } from '../types.ts';
import { NS } from './locales.ts';
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
/** Props for {@link WaitsList}. */
export interface WaitsListProps {
    /** Folded wait views in creation order. */
    waits: readonly GoodJobWaitView[];
    /** Namespace translator. */
    t: TranslateNS<typeof NS>;
}
/**
 * Render the waits section body.
 * @param props - waits and translator.
 * @returns the list, or the empty line.
 */
export declare function WaitsList({ waits, t }: WaitsListProps): import("react").JSX.Element;
