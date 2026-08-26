// @vitest-environment jsdom
/** GoodJob workspace visibility and restoration settings use the DSH settings API. */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULTS } from '../src/config-types.ts'
import { GoodJobSettingsCard } from '../src/client/SettingsCard.tsx'

afterEach(() => { cleanup() })

describe('GoodJobSettingsCard', () => {
  it('stages workspace and Explorer choices in one revision-checked patch', async () => {
    const describeSettings = vi.fn(async () => ({ result: { ok: true as const, value: {
      writable: true,
      namespaces: [{ ns: 'goodjob', revision: 7, value: DEFAULTS }],
    } } }))
    const update = vi.fn(async () => ({ result: { ok: true as const, value: { revision: 8 } } }))
    const api = { settings: { describe: describeSettings, update } } as unknown as IApiClient
    render(<GoodJobSettingsCard api={api} />)

    const restore = await screen.findByRole('checkbox', { name: 'Restore open tabs and split layout' })
    fireEvent.click(restore)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Relationship graph' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Completed tasks in Explorer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        ns: 'goodjob',
        patch: { restoreWorkspace: false, showGraph: false, showCompletedTasks: true },
        expectedRevision: 7,
      })
    })
  })
})
