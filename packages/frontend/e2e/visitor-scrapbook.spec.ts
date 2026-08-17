import { expect, test } from '@playwright/test'

const sampleEntries = {
  entries: [
    {
      id: 2,
      name: 'Ada Lovelace',
      message: 'A thoughtful note from the scrapbook test fixture.',
      created_at: '2026-08-17T12:00:00.000Z',
    },
  ],
  page: { limit: 20, next_cursor: null },
}

async function stubGuestbook(page: import('@playwright/test').Page) {
  await page.route('**/api/guestbook?*', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(sampleEntries) })
  })
}

for (const theme of ['winxp', 'win98'] as const) {
  test(`${theme} renders the Visitor Scrapbook feed and supports keyboard composer entry`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem('2000sme:theme', selectedTheme)
    }, theme)
    await stubGuestbook(page)
    await page.goto('/#/apps/guestbook')

    await expect(page.locator('html')).toHaveAttribute('data-os-theme', theme)
    await expect(page.getByRole('heading', { name: 'Visitor Scrapbook', level: 1 })).toBeVisible()
    await expect(page.getByRole('list', { name: 'Visitor notes in chronological order' })).toBeVisible()
    await expect(page.getByRole('article', { name: 'Ada Lovelace' })).toContainText('thoughtful note')

    await page.getByRole('tab', { name: 'Leave a note' }).click()
    const name = page.getByLabel('Your name')
    await expect(name).toBeFocused()
    await name.fill('Grace Hopper')
    await page.getByLabel('Your note').fill('Accessible scrapbook notes are easy to follow.')
    await expect(page.getByText('46/280 characters')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add note to scrapbook' })).toBeDisabled()
  })
}

test('keeps the desktop-window composer fields editable after the window receives focus', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open Visitor Scrapbook' }).dblclick()

  const scrapbookWindow = page.getByRole('dialog', { name: 'Visitor Scrapbook window' })
  await expect(scrapbookWindow).toBeVisible()
  await scrapbookWindow.getByRole('tab', { name: 'Leave a note' }).click()

  const name = scrapbookWindow.getByLabel('Your name')
  const note = scrapbookWindow.getByLabel('Your note')
  await name.fill('Leonardo')
  await note.fill('Windowed composer input remains available.')

  await expect(name).toHaveValue('Leonardo')
  await expect(note).toHaveValue('Windowed composer input remains available.')
  await expect(scrapbookWindow.getByText('42/280 characters')).toBeVisible()
})

test('keeps scrapbook tabs and composer readable at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await stubGuestbook(page)
  await page.goto('/#/apps/guestbook')

  await page.getByRole('tab', { name: 'Leave a note' }).click()
  await expect(page.getByLabel('Your name')).toBeVisible()
  await expect(page.getByLabel('Your note')).toBeVisible()
  const submitBox = await page.getByRole('button', { name: 'Add note to scrapbook' }).boundingBox()
  expect(submitBox).not.toBeNull()
  expect(submitBox!.width).toBeGreaterThanOrEqual(250)
  expect(submitBox!.height).toBeGreaterThanOrEqual(36)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
})

test('keeps deterministic scrapbook decoration while loading older notes and returning to the newest note', async ({ page }) => {
  await page.route('**/api/guestbook?*', async (route) => {
    const requestUrl = new URL(route.request().url())
    const cursor = requestUrl.searchParams.get('cursor')
    const body = cursor
      ? {
          entries: [{ id: 1, name: 'Grace Hopper', message: 'An older archived note.', created_at: '2026-08-16T12:00:00.000Z' }],
          page: { limit: 20, next_cursor: null },
        }
      : {
          entries: [{ id: 2, name: 'Ada Lovelace', message: 'A newest note with a stable visual identity.', created_at: '2026-08-17T12:00:00.000Z' }],
          page: { limit: 20, next_cursor: 'older-page' },
        }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.goto('/#/apps/guestbook')

  const newest = page.getByRole('article', { name: 'Ada Lovelace' })
  const firstDecoration = await newest.evaluate((element) => ({
    paper: element.getAttribute('data-paper'),
    tape: element.getAttribute('data-tape'),
    tilt: element.getAttribute('data-tilt'),
    corner: element.getAttribute('data-corner'),
    accent: element.getAttribute('data-accent'),
  }))

  await page.getByRole('button', { name: 'Load older notes' }).click()
  await expect(page.getByRole('article', { name: 'Grace Hopper' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Jump to newest' })).toBeVisible()
  await expect(newest).toHaveAttribute('data-paper', firstDecoration.paper ?? '')
  await expect(newest).toHaveAttribute('data-tape', firstDecoration.tape ?? '')
  await expect(newest).toHaveAttribute('data-tilt', firstDecoration.tilt ?? '')

  const feed = page.getByRole('list', { name: 'Visitor notes in chronological order' })
  await feed.evaluate((element) => { element.scrollTop = 80 })
  await page.getByRole('button', { name: 'Jump to newest' }).click()
  await expect.poll(() => feed.evaluate((element) => element.scrollTop)).toBe(0)
})
