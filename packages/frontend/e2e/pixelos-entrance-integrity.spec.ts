import { expect, test, type Page } from '@playwright/test'

const INTRO_SEEN_KEY = '2000sme:pixelos-intro-seen:v1'

async function beginFreshIntro(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.sessionStorage.clear())
  await page.reload()
  await expect(page.locator('main[data-intro-stage="boot"]')).toBeVisible()
}

async function reachEnterScreen(page: Page) {
  await expect(page.getByRole('button', { name: 'Enter Desktop' })).toBeVisible({ timeout: 2_500 })
  await expect(page.locator('main[data-intro-stage="enter"]')).toBeVisible()
}

test.describe('TEST-14 PixelOS entrance route and state-integrity coverage', () => {
  test('captures repeatable Stage 1, Stage 2, and entered-desktop evidence while preserving the documented focus path', async ({ page }, testInfo) => {
    await beginFreshIntro(page)

    const skip = page.getByRole('button', { name: 'Skip intro' })
    await expect(skip).toBeFocused()
    await expect(page.getByText('PREPARING DESKTOP')).toBeVisible()
    await testInfo.attach('test-14-stage-1-boot-card', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })

    await reachEnterScreen(page)
    const enter = page.getByRole('button', { name: 'Enter Desktop' })
    await expect(enter).toBeFocused()
    await expect(page.getByRole('button', { name: 'Skip to Desktop' })).toBeVisible()
    await expect(page.getByText('LEONARDO CAVAZZANI')).toBeVisible()
    await testInfo.attach('test-14-stage-2-enter-pixelos', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })

    await page.keyboard.press('Enter')
    const desktop = page.getByRole('main', { name: 'Desktop' })
    await expect(desktop).toBeVisible()
    await testInfo.attach('test-14-entered-desktop', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    expect(await page.evaluate((key) => window.sessionStorage.getItem(key), INTRO_SEEN_KEY)).toBe('true')
  })

  test('supports immediate pointer exits, session-only refresh behavior, direct-route bypass, and original portfolio semantics', async ({ page }) => {
    await beginFreshIntro(page)
    await page.getByRole('button', { name: 'Skip intro' }).click()
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0)

    await page.goto('/#/apps/minesweeper')
    await expect(page.getByRole('main', { name: 'MINESWEEPER.EXE direct route' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /sign in|log in|create account/i })).toHaveCount(0)
  })

  test('keeps the reduced-effects entrance static and usable at a narrow mobile viewport', async ({ browser }, testInfo) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.evaluate(() => window.sessionStorage.clear())
    await page.reload()

    await reachEnterScreen(page)
    await expect(page.locator('html')).toHaveAttribute('data-theme-effects', 'reduced')
    await expect(page.locator('main[data-intro-stage="boot"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Enter Desktop' })).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await testInfo.attach('test-14-reduced-effects-mobile-entry', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await page.close()
  })

  test('retains semantic controls and desktop shell state when decorative entrance assets cannot load', async ({ page }) => {
    await page.route('**/pixelos/intro/*.png', (route) => route.abort())
    await beginFreshIntro(page)

    await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused()
    await reachEnterScreen(page)
    await expect(page.getByRole('button', { name: 'Enter Desktop' })).toBeFocused()
    await page.getByRole('button', { name: 'Enter Desktop' }).click()

    const desktop = page.getByRole('main', { name: 'Desktop' })
    await expect(desktop).toBeVisible()
    const machineLauncher = page.getByRole('button', { name: 'Open MY MACHINE' })
    await machineLauncher.focus()
    await expect(machineLauncher).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'MY MACHINE window' })).toBeVisible()
    await expect(page.locator('[data-window-taskbar="my-computer"]')).toBeVisible()

    const start = page.getByRole('button', { name: 'Start' })
    await start.focus()
    await page.keyboard.press('Enter')
    const startMenu = page.getByRole('navigation', { name: 'Start menu' })
    await expect(startMenu.getByRole('button', { name: 'MY MACHINE' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(start).toBeFocused()
  })
})
