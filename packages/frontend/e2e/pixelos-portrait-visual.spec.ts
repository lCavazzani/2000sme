import { expect, test } from '@playwright/test'

const stableScreenshot = { animations: 'disabled' as const, caret: 'hide' as const }
const heroPath = '/pixelos/portraits/pixelos-leonardo-entry-hero-00.png'
const profilePath = '/pixelos/portraits/pixelos-leonardo-profile-64-00.png'

async function beginFreshIntro(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => window.sessionStorage.clear())
  await page.goto('/')
}

test.describe('TEST-19 PXOS-12 portrait visual and responsive review', () => {
  test('keeps the Stage 2 hero portrait crisp and native-scale beside the unchanged entrance controls', async ({ page }) => {
    await beginFreshIntro(page)
    const enter = page.getByRole('button', { name: 'Enter Desktop' })
    const skip = page.getByRole('button', { name: 'Skip to Desktop' })
    const hero = page.locator(`img[src="${heroPath}"]`)

    await expect(enter).toBeVisible({ timeout: 2_500 })
    await expect(skip).toBeVisible()
    await expect(hero).toHaveAttribute('alt', '')
    expect(await hero.evaluate((image) => {
      const rect = image.getBoundingClientRect()
      return [rect.width, rect.height, getComputedStyle(image).imageRendering]
    })).toEqual([128, 128, 'pixelated'])
    await expect(page).toHaveScreenshot('portrait-stage-2-desktop.png', stableScreenshot)
  })

  test('keeps the static Resume owner context crisp, text-complete, and unclipped at compact width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/#/apps/resume')

    const owner = page.getByLabel('Resume owner')
    const profile = owner.locator(`img[src="${profilePath}"]`)
    await expect(owner).toContainText('RESUME OWNER')
    await expect(owner).toContainText('LEONARDO CAVAZZANI')
    await expect(owner).toContainText('Senior Software Engineer')
    await expect(owner).not.toContainText('ONLINE')
    await expect(owner).not.toContainText('TYPING')
    expect(await profile.evaluate((image) => {
      const rect = image.getBoundingClientRect()
      return [rect.width, rect.height, getComputedStyle(image).imageRendering]
    })).toEqual([64, 64, 'pixelated'])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page).toHaveScreenshot('portrait-resume-compact.png', stableScreenshot)
  })
})
