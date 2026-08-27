/**
 * Mapping from Session-search results onto addressable GoodJob entities.
 *
 * The authority is DSH's `sessionQuery`-backed search (`sessions.search`),
 * whose items carry only a session id and a text snippet. A result is
 * navigable only when its session resolves against the workspace's displayed
 * lineage; every other hit stays a plain identifier-plus-snippet row instead
 * of being guessed into an entity. Pure and synchronous for testing.
 * @module dsh-goodjob/client/search
 */

/** Structural shape of one upstream search hit. */
export interface SessionSearchHit {
  sessionId: string
  snippet: string
}

/** Structural subset of an addressable Agent row. */
export interface SearchAgentLike {
  id: string
  label?: string
}

/** One rendered search result: either navigable or terminal. */
export interface SearchMappedResult {
  sessionId: string
  snippet: string
  label?: string
  /** Entity to open; absent when the session is outside displayed lineage. */
  target?: { kind: 'agent'; sessionId: string }
}

/**
 * Resolve each raw hit against displayed agents.
 * @param items - authoritative search items (already bounded upstream at 20).
 * @param agents - the workspace's addressable agent rows.
 * @returns one row per item, order preserved.
 */
export function mapSearchResults(
  items: readonly SessionSearchHit[] | undefined,
  agents: readonly SearchAgentLike[],
): readonly SearchMappedResult[] {
  if (items === undefined || items.length === 0) return []
  return items.map(item => {
    const agent = agents.find(candidate => String(candidate.id) === String(item.sessionId))
    return {
      sessionId: item.sessionId,
      snippet: item.snippet,
      ...(agent === undefined ? {} : { label: agent.label }),
      ...(agent === undefined ? {} : { target: { kind: 'agent', sessionId: item.sessionId } as const }),
    }
  })
}
