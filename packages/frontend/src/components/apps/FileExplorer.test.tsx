import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { appQueryClient } from '../../api/queryClient'
import { projectCatalogQuery } from '../../api/projects'
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

const CACHED_CATALOG = {
  projects: [
    {
      slug: 'cached-entry',
      name: 'Cached Entry',
      summary: 'Previously fetched.',
      year: 2024,
      thumbnail: '/desktop-icons/my-computer.svg',
      technologies: [{ name: 'Hono' }],
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

  await user.click(sportifolio)

  expect(sportifolio).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText(/2026 · React, TypeScript/)).toBeVisible()
  expect(screen.queryByText(/^Offline/)).not.toBeInTheDocument()
})

it('requests the catalog from the resolved Worker path', async () => {
  const fetchMock = vi.fn(async () => jsonResponse(CATALOG))
  vi.stubGlobal('fetch', fetchMock)
  renderExplorer()

  await screen.findByRole('button', { name: '00SPORTIFOLIO' })

  expect(fetchMock).toHaveBeenCalledWith('/api/projects', expect.objectContaining({
    headers: { Accept: 'application/json' },
  }))
})

it('keeps showing the previous catalog when a refetch fails', async () => {
  // Prime the cache with a successful read, then make the network fail.
  appQueryClient.setQueryData(projectCatalogQuery.queryKey, CACHED_CATALOG.projects)
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, { status: 503 })))
  renderExplorer()

  expect(await screen.findByRole('button', { name: 'CACHED ENTRY' })).toBeVisible()
  await waitFor(() => expect(screen.getByText(/last catalog read/i)).toBeVisible())
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('falls back to the bundled catalog when the Worker is unreachable', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down') }))
  renderExplorer()

  expect(await screen.findByRole('button', { name: '00SPORTIFOLIO' })).toBeVisible()
  expect(screen.getByText(/bundled catalog/i)).toBeVisible()
  // Degraded, not broken: no error surface, chrome intact.
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Current path')).toBeVisible()
})

it('falls back rather than erroring on a malformed payload', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ projects: [{ slug: 'broken' }] })))
  renderExplorer()

  expect(await screen.findByRole('button', { name: '00SPORTIFOLIO' })).toBeVisible()
  expect(screen.getByText(/bundled catalog/i)).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('never presents fictional placeholder projects', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down') }))
  renderExplorer()

  await screen.findByRole('button', { name: '00SPORTIFOLIO' })

  expect(screen.queryByText(/PROJECT ALPHA/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/PROJECT BETA/i)).not.toBeInTheDocument()
})
