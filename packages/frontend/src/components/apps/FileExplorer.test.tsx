import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { appQueryClient } from '../../api/queryClient'
import { jsonResponse } from '../../test/setup'
import { FileExplorer } from './FileExplorer'

const CATALOG = {
  projects: [
    {
      slug: 'sportifolio',
      name: '00sportifolio',
      summary: 'An interactive pixel-art desktop portfolio.',
      year: 2026,
      thumbnail: '/desktop-icons/my-computer.svg',
      technologies: [{ name: 'React' }, { name: 'TypeScript' }],
    },
  ],
}

function renderExplorer() {
  return render(
    <QueryClientProvider client={appQueryClient}>
      <FileExplorer />
    </QueryClientProvider>,
  )
}

it('renders the live catalog through the My Machine layout', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(CATALOG)))
  const user = userEvent.setup()
  renderExplorer()

  expect(screen.getByLabelText('Current path')).toHaveTextContent('C:\\PORTFOLIO\\')

  const sportifolio = await screen.findByRole('button', { name: '00SPORTIFOLIO' })
  expect(screen.getByRole('button', { name: 'PORTFOLIO (C:)' })).toBeVisible()
  expect(screen.getByText(/object\(s\)$/)).toBeVisible()

  await user.click(sportifolio)

  expect(sportifolio).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText(/2026 · React, TypeScript/)).toBeVisible()
})

it('requests the catalog from the same-origin Worker path', async () => {
  const fetchMock = vi.fn(async () => jsonResponse(CATALOG))
  vi.stubGlobal('fetch', fetchMock)
  renderExplorer()

  await screen.findByRole('button', { name: '00SPORTIFOLIO' })

  expect(fetchMock).toHaveBeenCalledWith('/api/projects', expect.objectContaining({
    headers: { Accept: 'application/json' },
  }))
})

it('contains a catalog failure inside the window and offers a retry', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: 'nope' }, { status: 503 })))
  renderExplorer()

  const alert = await screen.findByRole('alert', { name: 'My Machine error' })

  expect(alert).toHaveTextContent(/could not load/i)
  expect(alert).toHaveTextContent(/unavailable/i)
  // The shell chrome survives: the path bar is still mounted beside the error.
  expect(screen.getByLabelText('Current path')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
})

it('rejects a catalog payload with an unexpected shape', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ projects: [{ slug: 'broken' }] })))
  renderExplorer()

  expect(await screen.findByRole('alert', { name: 'My Machine error' })).toHaveTextContent(/unexpected shape/i)
})
