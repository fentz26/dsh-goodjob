// @vitest-environment jsdom
/** Browser rendering for exact group membership and authoritative states. */
import { render, screen } from '@testing-library/react'
import type { JobView } from '@deepseek-ai/dsh-client-connection/client'
import { describe, expect, it, vi } from 'vitest'
import { GroupsList } from '../src/client/GroupsList.tsx'
import { groupId } from '../src/groups.ts'

describe('GroupsList', () => {
  it('shows settled counts without synthetic percentages and opens member logs', () => {
    const onLogs = vi.fn()
    const jobs = [
      { id: 'bash-1', kind: 'bash', label: 'one', status: 'completed', startedAt: 1, finishedAt: 2 },
      { id: 'bash-2', kind: 'bash', label: 'two', status: 'running', startedAt: 1 },
    ] as unknown as JobView[]
    render(<GroupsList groups={[{
      id: groupId('group-1'), ownerSessionId: 'session-1', revision: 1,
      label: 'checks', jobIds: ['bash-1', 'bash-2'], createdAt: 1,
    }]} jobs={jobs} autoExpandActive onLogs={onLogs} />)
    expect(screen.getByText('1/2 settled')).toBeTruthy()
    expect(screen.queryByText(/%/)).toBeNull()
    screen.getAllByRole('button', { name: 'Logs' })[1]!.click()
    expect(onLogs).toHaveBeenCalledWith('bash-2')
  })
})
