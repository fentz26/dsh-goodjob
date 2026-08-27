/**
 * Exact rendering helpers for the `tokenUsage` Session projection published by
 * `@deepseek-ai/dsh-token-meter`. Values are authoritative accumulations over
 * the durable log; this module only formats them. No cost in any currency is
 * ever derived — there is no authoritative price field upstream.
 * @module dsh-goodjob/client/usage
 */
/** Structural face of the upstream projection value. */
export interface TokenUsageLike {
    uncachedInputTokens?: number;
    outputTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
}
/** One labeled row of exact usage figures. */
export interface UsageRow {
    key: keyof TokenUsageLike | 'billedInput';
    label: string;
    tokens: number;
}
/**
 * Compose the display rows, exact and double-count-free by construction:
 * `input (billed)` separates uncached input from the two cache fields rather
 * than summing them anywhere.
 * @param usage - the projection whole-value (undefined when absent).
 * @returns rows with strictly positive counts only.
 */
export declare function usageRows(usage: TokenUsageLike | null | undefined): readonly UsageRow[];
/**
 * Compact exact grouping (never lossy rounding): below ten thousand stays
 * literal, otherwise round-to-nearest-thousand abbreviated as e.g. `84k`,
 * then millions. Always paired with exact tooltips at render sites.
 * @param tokens - non-negative integer count.
 */
export declare function formatTokens(tokens: number): string;
