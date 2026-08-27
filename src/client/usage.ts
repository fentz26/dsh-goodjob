/**
 * Exact rendering helpers for the `tokenUsage` Session projection published by
 * `@deepseek-ai/dsh-token-meter`. Values are authoritative accumulations over
 * the durable log; this module only formats them. No cost in any currency is
 * ever derived — there is no authoritative price field upstream.
 * @module dsh-goodjob/client/usage
 */

/** Structural face of the upstream projection value. */
export interface TokenUsageLike {
  uncachedInputTokens?: number
  outputTokens?: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
}

/** One labeled row of exact usage figures. */
export interface UsageRow {
  key: keyof TokenUsageLike | 'billedInput'
  label: string
  tokens: number
}

/**
 * Compose the display rows, exact and double-count-free by construction:
 * `input (billed)` separates uncached input from the two cache fields rather
 * than summing them anywhere.
 * @param usage - the projection whole-value (undefined when absent).
 * @returns rows with strictly positive counts only.
 */
export function usageRows(usage: TokenUsageLike | null | undefined): readonly UsageRow[] {
  if (usage === null || usage === undefined) return []
  const rows: UsageRow[] = []
  if ((usage.uncachedInputTokens ?? 0) > 0) {
    rows.push({ key: 'uncachedInputTokens', label: 'input (uncached)', tokens: usage.uncachedInputTokens! })
  }
  if ((usage.cacheReadTokens ?? 0) > 0) {
    rows.push({ key: 'cacheReadTokens', label: 'cache read', tokens: usage.cacheReadTokens! })
  }
  if ((usage.cacheWriteTokens ?? 0) > 0) {
    rows.push({ key: 'cacheWriteTokens', label: 'cache write', tokens: usage.cacheWriteTokens! })
  }
  if ((usage.outputTokens ?? 0) > 0) {
    rows.push({ key: 'outputTokens', label: 'output', tokens: usage.outputTokens! })
  }
  return rows
}

/**
 * Compact exact grouping (never lossy rounding): below ten thousand stays
 * literal, otherwise round-to-nearest-thousand abbreviated as e.g. `84k`,
 * then millions. Always paired with exact tooltips at render sites.
 * @param tokens - non-negative integer count.
 */
export function formatTokens(tokens: number): string {
  if (!Number.isFinite(tokens) || tokens < 0) return '0'
  if (tokens < 10_000) return String(tokens)
  if (tokens < 1_000_000) return `${Math.round(tokens / 1000)}k`
  return `${Math.round(tokens / 100_000) / 10}M`
}
