import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client';
/** Props for {@link GoodJobSettingsCard}. */
export interface SettingsCardProps {
    /** Typed client API face (settings describe/update). */
    api: IApiClient;
}
/**
 * Render the GoodJob configuration card.
 * @param props - API access.
 * @returns the card body, or null before the namespace answers.
 */
export declare function GoodJobSettingsCard({ api }: SettingsCardProps): import("react").JSX.Element | null;
