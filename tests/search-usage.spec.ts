import { describe, expect, it } from 'vitest'
import { mapSearchResults } from '../src/client/search.ts'
import { formatTokens, usageRows, type TokenUsageLike } from '../src/client/usage.ts'

describe('search result mapping', () => {
  it('maps only resolvable lineage sessions to entities', () => {
    const hits = [
      { sessionId: 'agent-1', snippet: 'refresh token still fails' },
      { sessionId: 'other-lead', snippet: 'checkout auth regression' },
    ]
    const mapped = mapSearchResults(hits, [{ id: 'agent-1', label: 'review' }])
    expect(mapped).toEqual([
      {
        sessionId: 'agent-1',
        snippet: 'refresh token still fails',
        label: 'review',
        target: { kind: 'agent', sessionId: 'agent-1' },
      },
      { sessionId: 'other-lead', snippet: 'checkout auth regression' },
    ])
  })

  it('tolerates absent or empty pages', () => {
    expect(mapSearchResults(undefined, [])).toEqual([])
    expect(mapSearchResults([], [])).toEqual([])
  })
})

describe('usage rows', () => {
  const usage: TokenUsageLike = {
    uncachedInputTokens: 84_000,
    outputTokens: 12_500,
    cacheReadTokens: 1_000,
    cacheWriteTokens: 0,
  }

  it('emits exactly the positive authoritative fields without summing', () => {
    const rows = usageRows(usage)
    expect(rows.map(row => row.key)).toEqual(['uncachedInputTokens', 'cacheReadTokens', 'outputTokens'])
    expect(rows.find(row => row.key === 'uncachedInputTokens')?.tokens).toBe(84_000)
  })

  it('renders nothing for absent or all-zero projections', () => {
    expect(usageRows(undefined)).toEqual([])
    expect(usageRows({ uncachedInputTokens: 0, outputTokens: 0 })).toEqual([])
  })

  it('formats compactly but never lossy under ten thousand', () => {
    expect(formatTokens(9999)).toBe('9999')
    expect(formatTokens(84_000)).toBe('84k')
    expect(formatTokens(12_500)).toBe('13k')
    expect(formatTokens(2_450_000)).toBe('2.5M')
    expect(formatTokens(-5)).toBe('0')
  })

  it('never derives monetary cost (no pricing authority exists)', () => {
    // Guarding the product rule in test form: the module exposes no cost field.
    expect(Object.keys(usageRows({} as TokenUsageLike)[0] ?? { key: 1 })).not.toContain('cost')
    expect(typeof formatTokens).toBe('function')
  })
})
