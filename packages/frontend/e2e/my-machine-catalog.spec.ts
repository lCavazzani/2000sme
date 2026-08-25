import { expect, test, type Page } from '@playwright/test'

const CATALOG_ROUTE = '**/api/projects'

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

async function visitPixelOs(page: Page, path = '/') {
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

/**
 * Guards the regression that reached deployed development: My Machine moved from
 * bundled data to a fetched catalog, and a green root/health deploy check could
 * not see that the application surface itself had stopped rendering objects.
 */
test.describe('My Machine catalog direct route', () => {
  test('renders catalog objects from a healthy backend', async ({ page }) => {
    await page.route(CATALOG_ROUTE, (route) => route.fulfill({ json: CATALOG }))
    await visitPixelOs(page, '/#/apps/my-computer')

    const grid = page.getByRole('list', { name: 'Portfolio machine objects' })
    await expect(grid.getByRole('button', { name: 'PORTFOLIO (C:)' })).toBeVisible()
    await expect(grid.getByRole('button', { name: '00SPORTIFOLIO' })).toBeVisible()

    // A healthy read must not advertise degraded state.
    await expect(page.getByText(/^Offline/)).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('degrades to the bundled catalog when the backend is unreachable', async ({ page }) => {
    await page.route(CATALOG_ROUTE, (route) => route.abort('failed'))
    await visitPixelOs(page, '/#/apps/my-computer')

    // The window still lists real objects rather than showing a failure.
    await expect(
      page.getByRole('list', { name: 'Portfolio machine objects' }).getByRole('button', { name: '00SPORTIFOLIO' }),
    ).toBeVisible()
    await expect(page.getByText(/bundled catalog/i)).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
    // Shell chrome survives the outage.
    await expect(page.getByLabel('Current path')).toBeVisible()
  })

  test('degrades on a server error without surfacing an error page', async ({ page }) => {
    await page.route(CATALOG_ROUTE, (route) => route.fulfill({ status: 503, json: { error: 'down' } }))
    await visitPixelOs(page, '/#/apps/my-computer')

    await expect(page.getByText(/^Offline/)).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('never publishes retired placeholder projects', async ({ page }) => {
    await page.route(CATALOG_ROUTE, (route) => route.abort('failed'))
    await visitPixelOs(page, '/#/apps/my-computer')

    await expect(page.getByRole('button', { name: '00SPORTIFOLIO' })).toBeVisible()
    await expect(page.getByRole('button', { name: /PROJECT ALPHA/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /PROJECT BETA/i })).toHaveCount(0)
  })

  test('recovers to live data once the backend returns', async ({ page }) => {
    let healthy = false
    await page.route(CATALOG_ROUTE, (route) =>
      healthy ? route.fulfill({ json: CATALOG }) : route.abort('failed'))

    await visitPixelOs(page, '/#/apps/my-computer')
    await expect(page.getByText(/bundled catalog/i)).toBeVisible()

    // Reopening the window with a healthy backend must clear the degraded note
    // rather than latch the fallback for the rest of the session.
    healthy = true
    await page.reload()
    await expect(
      page.getByRole('list', { name: 'Portfolio machine objects' }).getByRole('button', { name: '00SPORTIFOLIO' }),
    ).toBeVisible()
    await expect(page.getByText(/^Offline/)).toHaveCount(0)
  })
})
