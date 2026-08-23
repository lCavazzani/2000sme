import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/') {
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function openSignal(page: Page) {
  await page.getByRole('button', { name: 'Open SIGNAL.EXE' }).dblclick()
  return page.getByRole('dialog', { name: 'SIGNAL.EXE — MITTENS window' })
}

test.describe('PXOS-13 SIGNAL.EXE local Mittens guide', () => {
  test('launches through PixelOS with one labelled conversation and a focused quick prompt', async ({ page }) => {
    await visitPixelOs(page)
    const signal = await openSignal(page)

    await expect(signal.getByRole('heading', { name: 'MITTENS' })).toBeVisible()
    await expect(signal.getByText('PIXEL OS GUIDE · LOCAL')).toBeVisible()
    await expect(signal.getByLabel('Mittens local guide conversation')).toBeVisible()
    await expect(signal.getByLabel('Mittens local guide conversation').getByRole('listitem')).toHaveCount(2)
    await expect(signal.getByRole('button', { name: 'PROJECTS' })).toBeFocused()
    await expect(signal.getByLabel('SIGNAL local privacy status')).toContainText('NO NETWORK')

    await signal.getByRole('button', { name: 'PROJECTS' }).click()
    await expect(signal.getByRole('button', { name: 'OPEN MY MACHINE' })).toBeVisible()
    await signal.getByRole('button', { name: 'OPEN MY MACHINE' }).click()
    await expect(page.getByRole('dialog', { name: 'MY MACHINE window' })).toBeVisible()
  })

  test('resolves directly and sends no typed or prompted local interaction over the network', async ({ page }) => {
    await visitPixelOs(page, '/#/apps/signal')
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    await expect(signal).toBeVisible()

    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await signal.getByRole('button', { name: 'RESUME' }).click()
    await signal.getByLabel('ASK THE LOCAL GUIDE').fill('unsupported local request')
    await signal.getByRole('button', { name: 'SEND LOCAL' }).click()
    await signal.getByRole('button', { name: 'WINK' }).click()
    await signal.getByRole('button', { name: 'ATTENTION' }).click()

    await expect(signal.getByText(/I only match local portfolio topics/i)).toBeVisible()
    expect(requests).toEqual([])
  })

  test('uses static reduced-effects attention feedback and retains guide identity when the decorative image fails', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await page.route('**/*7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg', (route) => route.abort())
    await page.goto('/#/apps/signal')

    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    await expect(signal.getByRole('heading', { name: 'MITTENS' })).toBeVisible()
    await signal.getByRole('button', { name: 'ATTENTION' }).click()
    await expect(signal.getByRole('status')).toHaveText('ATTENTION MARKED LOCALLY. EFFECTS ARE REDUCED.')
    await expect(signal.locator('header')).toHaveCSS('animation-name', 'none')
  })

  test('keeps one-column actions and composer within a narrow direct route', async ({ browser }) => {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile, '/#/apps/signal')
    const signal = mobile.getByRole('main', { name: 'SIGNAL.EXE direct route' })

    await expect(signal.getByRole('button', { name: 'PROJECTS' })).toBeVisible()
    await expect(signal.getByLabel('ASK THE LOCAL GUIDE')).toBeVisible()
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await mobile.close()
  })
})
