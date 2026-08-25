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
  await page.getByRole('button', { name: 'Open SIGNAL.EXE' }).dblclick()
  return page.getByRole('dialog', { name: 'SIGNAL.EXE — LEONARDO window' })
}

test.describe('PXOS-17 SIGNAL.EXE Leonardo quality gate', () => {
  test('keeps one labelled local transcript, Leonardo owner context, labelled tools, stable focus, and no legacy messenger surfaces', async ({ page }) => {
    await visitPixelOs(page)
    const signal = await openSignal(page)
    const transcript = signal.getByLabel('Leonardo local portfolio guide conversation')
    const quickPrompt = signal.getByRole('button', { name: 'PROJECTS' })

    await expect(quickPrompt).toBeFocused()
    await expect(transcript.getByRole('listitem')).toHaveCount(2)
    await expect(signal.getByRole('heading', { name: 'LEONARDO CAVAZZANI' })).toBeVisible()
    await expect(signal.getByLabel('Leonardo local portfolio guide profile')).toBeVisible()
    await expect(signal.getByText('LOCAL ONLY · NO NETWORK · NO STORAGE')).toBeVisible()
    await expect(signal.getByRole('button', { name: 'RESUME' })).toBeVisible()
    await expect(signal.getByRole('button', { name: 'ABOUT' })).toBeVisible()
    await expect(signal.getByText(/channel|contacts|unread|online|typing|available/i)).toHaveCount(0)

    await quickPrompt.click()
    await expect(transcript.getByRole('listitem')).toHaveCount(4)
    await expect(quickPrompt).toBeFocused()
    await expect(signal.locator('output[aria-live="polite"]')).toHaveCount(1)
    await expect(signal.locator('output[aria-live="polite"]')).toContainText('MY MACHINE contains a portfolio-safe project grid')

    await signal.getByLabel('MESSAGE THE LOCAL PORTFOLIO GUIDE').fill('unsupported local request')
    await signal.getByRole('button', { name: 'SEND LOCAL' }).click()
    await expect(transcript.getByText(/This local portfolio guide matches projects, resume, experience/i)).toBeVisible()
  })

  test('keeps prompts, composer, and cooldown actions completely local', async ({ page }) => {
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
    page.on('request', (request) => requests.push(request.url()))

    await signal.getByRole('button', { name: 'RESUME' }).click()
    await signal.getByLabel('MESSAGE THE LOCAL PORTFOLIO GUIDE').fill('skills')
    await signal.getByRole('button', { name: 'SEND LOCAL' }).click()
    await signal.getByRole('button', { name: 'WINK' }).click()
    await expect(signal.getByRole('button', { name: 'WINK' })).toBeDisabled()
    await signal.getByRole('button', { name: 'ATTENTION' }).click()
    await expect(signal.getByRole('button', { name: 'ATTENTION' })).toBeDisabled()
    await expect(signal.locator('output[aria-live="polite"]')).toContainText('ATTENTION MARKED LOCALLY.')

    await page.waitForTimeout(2_100)
    await expect(signal.getByRole('button', { name: 'WINK' })).toBeEnabled()
    await page.waitForTimeout(1_000)
    await expect(signal.getByRole('button', { name: 'ATTENTION' })).toBeEnabled()
    expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
    expect(await page.evaluate(() => (window as Window & { __signalRequestCount?: () => number }).__signalRequestCount?.() ?? 0)).toBe(0)
    expect(await page.evaluate(() => Object.keys(window.localStorage).some((key) => key.toLowerCase().includes('signal')))).toBe(false)
  })

  test('uses the smart blink only under full effects and retains static Leonardo identity for reduced effects and asset failure', async ({ page }) => {
    await visitPixelOs(page, '/#/apps/signal')
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const railImage = signal.getByLabel('Leonardo local portfolio guide profile').locator('img')
    await expect(railImage).toHaveAttribute('src', /pixelos-leonardo-entry-hero-smart-blink-128\.gif/)

    await page.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await page.goto('/?signal-reduced=1#/apps/signal')
    const reducedSignal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    const reducedImage = reducedSignal.getByLabel('Leonardo local portfolio guide profile').locator('img')
    await expect(reducedImage).toHaveAttribute('src', /pixelos-leonardo-entry-hero-static-128\.png/)
    await reducedSignal.getByRole('button', { name: 'ATTENTION' }).click()
    await expect(reducedSignal.locator('output[aria-live="polite"]')).toHaveText('ATTENTION MARKED LOCALLY. EFFECTS ARE REDUCED.')

    await page.route('**/pixelos/portraits/pixelos-leonardo-entry-hero-static-128.png', (route) => route.abort())
    await page.reload()
    await expect(page.getByRole('heading', { name: 'LEONARDO CAVAZZANI' })).toBeVisible()
  })

  test('records deterministic Leonardo default, typed-fallback, and reduced narrow review states', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } })
    await visitPixelOs(page, '/#/apps/signal', true)
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    await expect(signal).toHaveScreenshot('signal-guide-leonardo-reduced-default-chromium-linux.png')

    await signal.getByLabel('MESSAGE THE LOCAL PORTFOLIO GUIDE').fill('a local unrelated question')
    await signal.getByRole('button', { name: 'SEND LOCAL' }).click()
    await expect(signal).toHaveScreenshot('signal-guide-leonardo-typed-fallback-chromium-linux.png')
    await page.close()

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile, '/#/apps/signal', true)
    const narrowSignal = mobile.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    expect(await narrowSignal.getByLabel('Leonardo local portfolio guide profile').locator('img').evaluate((image) => image.currentSrc)).toContain('pixelos-leonardo-entry-hero-static-128.png')
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(narrowSignal).toHaveScreenshot('signal-guide-leonardo-reduced-narrow-chromium-linux.png')
    await mobile.close()
  })
})
