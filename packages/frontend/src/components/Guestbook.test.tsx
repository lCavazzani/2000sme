import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { queryState, mutationState } = vi.hoisted(() => ({
  queryState: {
    data: undefined as { pages: Array<{ entries: Array<{ id: number; name: string; message: string; created_at: string }>; page: { limit: number; next_cursor: string | null } }> } | undefined,
    isError: false,
    error: undefined as unknown,
    isPending: false,
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
  },
  mutationState: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}))

vi.mock('../api/guestbook', () => ({
  guestbookErrorMessage: (error: unknown) => error instanceof Error ? error.message : 'Unable to load notes.',
  useInfiniteGuestbookEntries: () => queryState,
  useCreateGuestbookEntry: () => mutationState,
}))

vi.mock('./TurnstileWidget', () => ({
  TurnstileWidget: () => <div data-testid="turnstile-widget" />,
}))

import { ThemeProvider } from '../theme/ThemeProvider'
import { Guestbook } from './Guestbook'

function renderGuestbook() {
  return render(
    <ThemeProvider>
      <Guestbook />
    </ThemeProvider>,
  )
}

function resetStates() {
  queryState.data = {
    pages: [
      {
        entries: [
          { id: 12, name: 'Ada Lovelace', message: 'Wonderful work on the portfolio.', created_at: '2026-08-17T12:00:00.000Z' },
          { id: 11, name: 'Grace Hopper', message: 'The scrapbook is easy to read.', created_at: '2026-08-16T12:00:00.000Z' },
        ],
        page: { limit: 20, next_cursor: null },
      },
    ],
  }
  queryState.isError = false
  queryState.error = undefined
  queryState.isPending = false
  queryState.isFetching = false
  queryState.isFetchingNextPage = false
  queryState.hasNextPage = false
  queryState.refetch.mockReset()
  queryState.fetchNextPage.mockReset()
  mutationState.isPending = false
  mutationState.mutateAsync.mockReset()
}

describe('Visitor Scrapbook', () => {
  beforeEach(() => {
    resetStates()
  })

  it('renders a chronological semantic note list and gives keyboard users a direct composer path', () => {
    renderGuestbook()

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

  it('keeps a stored entry visual identity deterministic across rerenders', () => {
    const { rerender } = renderGuestbook()
    const article = screen.getByRole('article', { name: 'Ada Lovelace' })
    const firstIdentity = {
      paper: article.getAttribute('data-paper'),
      tape: article.getAttribute('data-tape'),
      tilt: article.getAttribute('data-tilt'),
      corner: article.getAttribute('data-corner'),
      accent: article.getAttribute('data-accent'),
    }

    rerender(
      <ThemeProvider>
        <Guestbook />
      </ThemeProvider>,
    )
    const rerenderedArticle = screen.getByRole('article', { name: 'Ada Lovelace' })
    expect({
      paper: rerenderedArticle.getAttribute('data-paper'),
      tape: rerenderedArticle.getAttribute('data-tape'),
      tilt: rerenderedArticle.getAttribute('data-tilt'),
      corner: rerenderedArticle.getAttribute('data-corner'),
      accent: rerenderedArticle.getAttribute('data-accent'),
    }).toEqual(firstIdentity)
  })

  it('loads older notes through the typed infinite feed and offers a user-controlled jump to newest', () => {
    queryState.hasNextPage = true
    queryState.data!.pages.push({
      entries: [{ id: 10, name: 'Margaret Hamilton', message: 'An older note.', created_at: '2026-08-15T12:00:00.000Z' }],
      page: { limit: 20, next_cursor: 'older-cursor' },
    })

    renderGuestbook()

    fireEvent.click(screen.getByRole('button', { name: 'Load older notes' }))
    expect(queryState.fetchNextPage).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Jump to newest' })).toBeVisible()
  })

  it('uses inline field errors instead of making an invalid submission', () => {
    renderGuestbook()
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
    renderGuestbook()

    expect(screen.getByRole('alert')).toHaveTextContent('Visitor notes are unavailable.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(queryState.refetch).toHaveBeenCalledOnce()
  })
})
