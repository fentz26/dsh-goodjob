// @vitest-environment jsdom
/** Browser Team controls preserve delivery choice and expose no kill action. */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TeamsList } from '../src/client/TeamsList.tsx'

describe('TeamsList', () => {
  it('sends through GoodJob RPC and does not render a kill control', async () => {
    const call = vi.fn(async () => ({ ok: true as const, value: { status: 'accepted' } }))
    render(<TeamsList
      sessionId="lead-1"
      members={[{
        id: 'agent-1', name: 'writer', role: 'teammate', status: 'idle', diagnostics: [],
      }]}
      tasks={[]}
      messages={[]}
      showTasks
      showMailbox
      rpc={{ call }}
      onOpen={vi.fn()}
      onChanged={vi.fn()}
    />)
    expect(screen.queryByRole('button', { name: /kill/i })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Message' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Status?' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'wakeup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await vi.waitFor(() => {
      expect(call).toHaveBeenCalledWith('/goodjob', 'team.message', {
        sessionId: 'lead-1', target: 'writer', delivery: 'wakeup', text: 'Status?',
      })
    })
  })
})
