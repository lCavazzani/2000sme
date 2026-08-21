import { expect, test } from '@playwright/test'

async function beginFreshIntro(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => window.sessionStorage.clear())
  await page.goto('/')
}

test.describe('PXOS-11 optional PixelOS entrance', () => {
  test('shows an immediately focusable Boot Card skip action that reveals the retained desktop', async ({ page }) => {
    await beginFreshIntro(page)

    const skip = page.getByRole('button', { name: 'Skip intro' })
    await expect(skip).toBeVisible()
    await expect(skip).toBeFocused()
    await expect(page.getByRole('heading', { name: 'Pixel OS' })).toBeVisible()

    await skip.click()
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
    expect(await page.evaluate(() => window.sessionStorage.getItem('2000sme:pixelos-intro-seen:v1'))).toBe('true')
  })

  test('focuses Enter Desktop on the original personal entry screen and persists the completed session', async ({ page }) => {
    await beginFreshIntro(page)

    const enter = page.getByRole('button', { name: 'Enter Desktop' })
    await expect(enter).toBeVisible({ timeout: 1_500 })
    await expect(enter).toBeFocused()
    await expect(page.getByText('LEONARDO CAVAZZANI')).toBeVisible()
    await expect(page.getByText('Senior Software Engineer')).toBeVisible()

    await page.keyboard.press('Enter')
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0)
  })

  test('never blocks a direct application route and renders reduced-effects entry without a boot delay', async ({ browser }) => {
    const directRoute = await browser.newPage()
    await directRoute.goto('/#/apps/minesweeper')
    await expect(directRoute.getByRole('main', { name: 'MINESWEEPER.EXE direct route' })).toBeVisible()
    await expect(directRoute.getByRole('button', { name: 'Skip intro' })).toHaveCount(0)
    await directRoute.close()

    const reduced = await browser.newPage()
    await reduced.emulateMedia({ reducedMotion: 'reduce' })
    await beginFreshIntro(reduced)
    await expect(reduced.getByRole('button', { name: 'Enter Desktop' })).toBeVisible()
    await expect(reduced.getByRole('button', { name: 'Skip intro' })).toHaveCount(0)
    await reduced.close()
  })
})
