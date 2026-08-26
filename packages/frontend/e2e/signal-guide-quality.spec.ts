import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/', reduced = false) {
  await page.addInitScript((useReducedEffects) => {
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
    if (useReducedEffects) window.localStorage.setItem('2000sme:effects', 'reduced')
  }, reduced)
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

test.describe('PXOS-17 SIGNAL.EXE Leonardo quality gate', () => {
  test('keeps one labelled local transcript, Leonardo owner context, rail tools, inline Send, and no legacy messenger surfaces', async ({ page }) => {
    await visitPixelOs(page)
    const signal = await openSignal(page)
    const transcript = signal.getByLabel('Leonardo local portfolio guide conversation')
    const ownerRail = signal.getByLabel('Leonardo local portfolio guide profile')
    const projects = ownerRail.getByRole('button', { name: 'PROJECTS' })

    await expect(projects).toBeFocused()
    await expect(transcript.getByRole('listitem')).toHaveCount(2)
    await expect(signal.getByRole('heading', { name: 'LEONARDO CAVAZZANI' })).toBeVisible()
    await expect(ownerRail.getByRole('button', { name: 'RESUME' })).toBeVisible()
    await expect(ownerRail.getByRole('button', { name: 'ABOUT' })).toBeVisible()
    await expect(signal.getByRole('button', { name: 'WINK' })).toHaveCount(0)
    await expect(signal.getByRole('button', { name: 'ATTENTION' })).toHaveCount(0)
    await expect(signal.getByText('LOCAL ONLY · NO NETWORK · NO STORAGE')).toHaveCount(0)
    await expect(signal.getByText('OWNER CONTEXT')).toHaveCount(0)

    const composer = signal.getByLabel('MESSAGE THE LOCAL PORTFOLIO GUIDE')
    const send = signal.getByRole('button', { name: 'SEND' })
    await expect(composer).toHaveCSS('min-height', '56px')
    await expect(send).toHaveCSS('min-height', '56px')
    expect(await composer.evaluate((input) => input.getBoundingClientRect().top)).toBeCloseTo(
      await send.evaluate((button) => button.getBoundingClientRect().top),
      0,
    )

    await projects.click()
    await expect(transcript.getByRole('listitem')).toHaveCount(4)
    await expect(projects).toBeFocused()
    await expect(signal.locator('output[aria-live="polite"]')).toHaveCount(1)
    await expect(signal.locator('output[aria-live="polite"]')).toContainText('MY MACHINE contains a portfolio-safe project grid')

    await composer.fill('unsupported local request')
    await send.click()
    await expect(transcript.getByText(/This local portfolio guide matches projects, resume, experience/i)).toBeVisible()
  })

  test('keeps rail tools, composer, and deterministic replies completely local', async ({ page }) => {
    const requests: string[] = []
    await page.addInitScript(() => {
      let calls = 0
      const originalFetch = window.fetch.bind(window)
      window.fetch = (...args) => {
        calls += 1
        return originalFetch(...args)
      }
      const originalOpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function(...args) {
        calls += 1
        return originalOpen.apply(this, args)
      }
      ;(window as Window & { __signalRequestCount?: () => number }).__signalRequestCount = () => calls
    })
    await visitPixelOs(page, '/#/apps/signal')
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const ownerRail = signal.getByLabel('Leonardo local portfolio guide profile')
    page.on('request', (request) => requests.push(request.url()))

    await ownerRail.getByRole('button', { name: 'RESUME' }).click()
    await ownerRail.getByRole('button', { name: 'ABOUT' }).click()
    await signal.getByLabel('MESSAGE THE LOCAL PORTFOLIO GUIDE').fill('skills')
    await signal.getByRole('button', { name: 'SEND' }).click()

    expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
    expect(await page.evaluate(() => (window as Window & { __signalRequestCount?: () => number }).__signalRequestCount?.() ?? 0)).toBe(0)
    expect(await page.evaluate(() => Object.keys(window.localStorage).some((key) => key.toLowerCase().includes('signal')))).toBe(false)
  })

  test('uses the smart blink only under full effects and retains static Leonardo identity for reduced effects and asset failure', async ({ page }) => {
    await visitPixelOs(page, '/#/apps/signal')
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const railImage = signal.getByLabel('Leonardo local portfolio guide profile').locator('picture img')
    await expect(railImage).toHaveAttribute('src', /pixelos-leonardo-entry-hero-smart-blink-128\.gif/)

    await page.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await page.goto('/?signal-reduced=1#/apps/signal')
    const reducedSignal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const reducedImage = reducedSignal.getByLabel('Leonardo local portfolio guide profile').locator('picture img')
    await expect(reducedImage).toHaveAttribute('src', /pixelos-leonardo-entry-hero-static-128\.png/)

    await page.route('**/pixelos/portraits/pixelos-leonardo-entry-hero-static-128.png', (route) => route.abort())
    await page.reload()
    await expect(page.getByRole('heading', { name: 'LEONARDO CAVAZZANI' })).toBeVisible()
  })

  test('records deterministic final reduced desktop and narrow review states', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } })
    await visitPixelOs(page, '/#/apps/signal', true)
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    await expect(signal).toHaveScreenshot('signal-guide-final-reduced-default.png')
    await page.close()

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile, '/#/apps/signal', true)
    const narrowSignal = mobile.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const narrowOwnerRail = narrowSignal.getByLabel('Leonardo local portfolio guide profile')
    expect(await narrowOwnerRail.locator('picture img').evaluate((image) => image.currentSrc)).toContain('pixelos-leonardo-entry-hero-static-128.png')
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(narrowSignal).toHaveScreenshot('signal-guide-final-reduced-narrow.png')
    await mobile.close()
  })
})
