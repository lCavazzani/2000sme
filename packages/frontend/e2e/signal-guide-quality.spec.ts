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

test.describe('TEST-18 SIGNAL.EXE quality gate', () => {
  test('keeps one labelled local transcript, stable focus, concise live status, and no legacy messenger surfaces', async ({ page }) => {
    await visitPixelOs(page)
    const signal = await openSignal(page)
    const transcript = signal.getByLabel('Mittens local guide conversation')
    const quickPrompt = signal.getByRole('button', { name: 'PROJECTS' })

    await expect(quickPrompt).toBeFocused()
    await expect(transcript.getByRole('listitem')).toHaveCount(2)
    await expect(signal.locator('aside')).toHaveCount(0)
    await expect(signal.getByText(/channel|contacts|unread/i)).toHaveCount(0)

    await quickPrompt.click()
    await expect(transcript.getByRole('listitem')).toHaveCount(4)
    await expect(quickPrompt).toBeFocused()
    await expect(signal.locator('output[aria-live="polite"]')).toHaveCount(1)
    await expect(signal.locator('output[aria-live="polite"]')).toContainText('MY MACHINE contains a portfolio-safe project grid')

    await signal.getByLabel('ASK THE LOCAL GUIDE').fill('unsupported local request')
    await signal.getByRole('button', { name: 'SEND LOCAL' }).click()
    await expect(transcript.getByText(/I only match local portfolio topics/i)).toBeVisible()
  })

  test('keeps prompts, composer, WINK, and ATTENTION completely local and enforces one-shot cooldowns', async ({ page }) => {
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
    await signal.getByLabel('ASK THE LOCAL GUIDE').fill('skills')
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
    expect(requests).toEqual([])
    expect(await page.evaluate(() => (window as Window & { __signalRequestCount?: () => number }).__signalRequestCount?.() ?? 0)).toBe(0)
    expect(await page.evaluate(() => Object.keys(window.localStorage).some((key) => key.toLowerCase().includes('signal')))).toBe(false)
  })

  test('uses static reduced-effects attention feedback, keeps identity on image failure, and preserves a readable narrow layout', async ({ browser }) => {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await mobile.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await mobile.route('**/*7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg', (route) => route.abort())
    await mobile.goto('/#/apps/signal')
    const signal = mobile.getByRole('main', { name: 'SIGNAL.EXE direct route' })

    await expect(signal.getByRole('heading', { name: 'MITTENS' })).toBeVisible()
    await expect(signal.getByText('PIXEL OS GUIDE · LOCAL')).toBeVisible()
    await signal.getByRole('button', { name: 'ATTENTION' }).click()
    await expect(signal.locator('output[aria-live="polite"]')).toHaveText('ATTENTION MARKED LOCALLY. EFFECTS ARE REDUCED.')
    await expect(signal.locator('header')).toHaveCSS('animation-name', 'none')
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await expect(signal).toHaveScreenshot('signal-guide-reduced-attention-narrow-chromium-linux.png', { animations: 'disabled' })
    await mobile.close()
  })

  test('records deterministic default and typed-fallback review states', async ({ page }) => {
    await visitPixelOs(page, '/#/apps/signal')
    const signal = page.getByRole('main', { name: 'SIGNAL.EXE direct route' })
    await expect(signal).toHaveScreenshot('signal-guide-default-chromium-linux.png', { animations: 'disabled' })

    await signal.getByLabel('ASK THE LOCAL GUIDE').fill('a local unrelated question')
    await signal.getByRole('button', { name: 'SEND LOCAL' }).click()
    await expect(signal).toHaveScreenshot('signal-guide-typed-fallback-chromium-linux.png', { animations: 'disabled' })
  })
})
