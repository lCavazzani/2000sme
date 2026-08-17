import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { queryState, mutationState } = vi.hoisted(() => ({
  queryState: {
    data: undefined as { entries: Array<{ id: number; name: string; message: string; created_at: string }> } | undefined,
    isError: false,
    error: undefined as unknown,
    isPending: false,
    isFetching: false,
    refetch: vi.fn(),
  },
  mutationState: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}))

vi.mock('../api/guestbook', () => ({
  guestbookErrorMessage: (error: unknown) => error instanceof Error ? error.message : 'Unable to load notes.',
  useGuestbookEntries: () => queryState,
  useCreateGuestbookEntry: () => mutationState,
}))

vi.mock('./TurnstileWidget', () => ({
  TurnstileWidget: () => <div data-testid="turnstile-widget" />,
}))

import { Guestbook } from './Guestbook'

function resetStates() {
  queryState.data = {
    entries: [
      { id: 12, name: 'Ada Lovelace', message: 'Wonderful work on the portfolio.', created_at: '2026-08-17T12:00:00.000Z' },
      { id: 11, name: 'Grace Hopper', message: 'The scrapbook is easy to read.', created_at: '2026-08-16T12:00:00.000Z' },
    ],
  }
  queryState.isError = false
  queryState.error = undefined
  queryState.isPending = false
  queryState.isFetching = false
  queryState.refetch.mockReset()
  mutationState.isPending = false
  mutationState.mutateAsync.mockReset()
}

describe('Visitor Scrapbook', () => {
  beforeEach(() => {
    resetStates()
  })

  it('renders a chronological semantic note list and gives keyboard users a direct composer path', () => {
    render(<Guestbook />)

    expect(screen.getByRole('heading', { name: 'Notes from visitors', level: 2 })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Read notes' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('list', { name: 'Visitor notes in chronological order' })).toBeVisible()
    expect(screen.getByRole('article', { name: 'Ada Lovelace' })).toHaveTextContent('Wonderful work on the portfolio.')
    expect(document.querySelector('time')).toHaveAttribute('dateTime', '2026-08-17T12:00:00.000Z')

    fireEvent.click(screen.getByRole('tab', { name: 'Leave a note' }))

    expect(screen.getByRole('tab', { name: 'Leave a note' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Your name')).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Add note to scrapbook' })).toBeDisabled()
  })

  it('uses inline field errors instead of making an invalid submission', () => {
    render(<Guestbook />)
    fireEvent.click(screen.getByRole('tab', { name: 'Leave a note' }))

    const form = screen.getByLabelText('Your name').closest('form')
    fireEvent.submit(form!)

    expect(screen.getByText('Enter your name before leaving a note.')).toBeVisible()
    expect(screen.getByText('Write a note before signing the scrapbook.')).toBeVisible()
    expect(mutationState.mutateAsync).not.toHaveBeenCalled()
  })

  it('keeps the retry path available when the typed query reports an error', () => {
    queryState.data = undefined
    queryState.isError = true
    queryState.error = new Error('Visitor notes are unavailable.')
    render(<Guestbook />)

    expect(screen.getByRole('alert')).toHaveTextContent('Visitor notes are unavailable.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(queryState.refetch).toHaveBeenCalledOnce()
  })
})
