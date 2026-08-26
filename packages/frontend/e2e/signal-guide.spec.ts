import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/') {
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function openSignal(page: Page) {
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.getByRole('navigation', { name: 'Start menu' })
    .getByRole('button', { name: 'SIGNAL.EXE' })
    .click()
  return page.getByRole('dialog', { name: 'SIGNAL.EXE — LEONARDO window' })
}

test.describe('PXOS-17 SIGNAL.EXE Leonardo local portfolio guide', () => {
  test('launches through PixelOS with one labelled conversation, three owner-rail tools, and a focused local tool', async ({ page }) => {
    await visitPixelOs(page)
    const signal = await openSignal(page)
    const ownerRail = signal.getByLabel('Leonardo local portfolio guide profile')

    await expect(signal.getByRole('heading', { name: 'LEONARDO CAVAZZANI' })).toBeVisible()
    await expect(signal.getByText('SENIOR FRONTEND DEVELOPER · LOCAL PORTFOLIO GUIDE')).toBeVisible()
    await expect(signal.getByLabel('Leonardo local portfolio guide conversation')).toBeVisible()
    await expect(signal.getByLabel('Leonardo local portfolio guide conversation').getByRole('listitem')).toHaveCount(2)
    await expect(ownerRail.getByRole('button', { name: 'PROJECTS' })).toBeFocused()
    await expect(ownerRail.getByRole('button', { name: 'RESUME' })).toBeVisible()
    await expect(ownerRail.getByRole('button', { name: 'ABOUT' })).toBeVisible()
    await expect(signal.getByRole('button', { name: 'WINK' })).toHaveCount(0)
    await expect(signal.getByRole('button', { name: 'ATTENTION' })).toHaveCount(0)

    await ownerRail.getByRole('button', { name: 'PROJECTS' }).click()
    await expect(signal.getByRole('button', { name: 'OPEN MY MACHINE' })).toBeVisible()
    await signal.getByRole('button', { name: 'OPEN MY MACHINE' }).click()
    await expect(page.getByRole('dialog', { name: 'MY MACHINE window' })).toBeVisible()
  })

  test('resolves directly and sends no typed or owner-rail interaction over the network', async ({ page }) => {
    await visitPixelOs(page, '/#/apps/signal')
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const ownerRail = signal.getByLabel('Leonardo local portfolio guide profile')
    await expect(signal).toBeVisible()

    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await ownerRail.getByRole('button', { name: 'RESUME' }).click()
    await ownerRail.getByRole('button', { name: 'ABOUT' }).click()
    await signal.getByLabel('MESSAGE THE LOCAL PORTFOLIO GUIDE').fill('unsupported local request')
    await signal.getByRole('button', { name: 'SEND' }).click()

    await expect(signal.getByLabel('Leonardo local portfolio guide conversation').getByText(/This local portfolio guide matches projects, resume, experience/i)).toBeVisible()
    expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
  })

  test('uses a full-effects smart blink but a static source for reduced effects and image failure', async ({ page }) => {
    await visitPixelOs(page, '/#/apps/signal')
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const railImage = signal.getByLabel('Leonardo local portfolio guide profile').locator('picture img')
    await expect(railImage).toHaveAttribute('src', /pixelos-leonardo-entry-hero-smart-blink-128\.gif/)

    await page.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await page.goto('/?reduced-signal=1#/apps/signal')
    const reducedSignal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const reducedRailImage = reducedSignal.getByLabel('Leonardo local portfolio guide profile').locator('picture img')
    await expect(reducedRailImage).toHaveAttribute('src', /pixelos-leonardo-entry-hero-static-128\.png/)

    await page.route('**/pixelos/portraits/pixelos-leonardo-entry-hero-static-128.png', (route) => route.abort())
    await page.reload()
    await expect(page.getByRole('heading', { name: 'LEONARDO CAVAZZANI' })).toBeVisible()
  })

  test('keeps owner-rail tools and the static narrow portrait within the direct route', async ({ browser }) => {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile, '/#/apps/signal')
    const signal = mobile.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const ownerRail = signal.getByLabel('Leonardo local portfolio guide profile')

    await expect(ownerRail.getByRole('button', { name: 'PROJECTS' })).toBeVisible()
    await expect(ownerRail.getByRole('button', { name: 'RESUME' })).toBeVisible()
    await expect(ownerRail.getByRole('button', { name: 'ABOUT' })).toBeVisible()
    await expect(signal.getByLabel('MESSAGE THE LOCAL PORTFOLIO GUIDE')).toBeVisible()
    const railImage = ownerRail.locator('picture img')
    expect(await railImage.evaluate((image) => image.currentSrc)).toContain('pixelos-leonardo-entry-hero-static-128.png')
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await mobile.close()
  })
})
