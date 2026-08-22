import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const heroPath = '/pixelos/portraits/pixelos-leonardo-entry-hero-00.png'
const profilePath = '/pixelos/portraits/pixelos-leonardo-profile-64-00.png'

async function beginFreshIntro(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => window.sessionStorage.clear())
  await page.goto('/')
}

test.describe('TEST-17 PXOS-12 portrait integration and accessibility gate', () => {
  test('loads the approved Stage 2 hero portrait at its native identity scale without duplicate accessible identity text', async ({ page }) => {
    await beginFreshIntro(page)
    await expect(page.getByRole('button', { name: 'Enter Desktop' })).toBeVisible({ timeout: 2_500 })

    const hero = page.locator(`img[src="${heroPath}"]`)
    await expect(hero).toHaveAttribute('alt', '')
    await expect(hero).toHaveAttribute('width', '128')
    await expect(hero).toHaveAttribute('height', '128')
    expect(await hero.evaluate((image) => [image.naturalWidth, image.naturalHeight])).toEqual([128, 128])
    await expect(page.getByText('LEONARDO CAVAZZANI')).toHaveCount(1)
    await expect(page.getByText('Senior Software Engineer')).toHaveCount(1)
  })

  test('keeps the labeled Resume owner context static, decorative, and accessible', async ({ page }) => {
    await page.goto('/#/apps/resume')

    const owner = page.getByLabel('Resume owner')
    const profile = owner.locator(`img[src="${profilePath}"]`)
    await expect(owner).toContainText('RESUME OWNER')
    await expect(owner).toContainText('LEONARDO CAVAZZANI')
    await expect(owner).toContainText('Senior Software Engineer')
    await expect(profile).toHaveAttribute('alt', '')
    await expect(profile).toHaveAttribute('width', '64')
    await expect(profile).toHaveAttribute('height', '64')
    expect(await profile.evaluate((image) => [image.naturalWidth, image.naturalHeight])).toEqual([64, 64])

    const axeResults = await new AxeBuilder({ page }).include('[aria-label="RESUME.PDF viewer"]').analyze()
    expect(axeResults.violations).toEqual([])
  })

  test('preserves visible identity text and functional entrance/resume controls when portraits cannot load', async ({ browser }) => {
    const entry = await browser.newPage()
    await entry.route(`**${heroPath}`, (route) => route.abort())
    await beginFreshIntro(entry)
    await expect(entry.getByText('LEONARDO CAVAZZANI')).toBeVisible()
    await expect(entry.getByRole('button', { name: 'Enter Desktop' })).toBeEnabled()
    await entry.close()

    const resume = await browser.newPage()
    await resume.route(`**${profilePath}`, (route) => route.abort())
    await resume.goto('/#/apps/resume')
    await expect(resume.getByLabel('Resume owner')).toContainText('LEONARDO CAVAZZANI')
    await expect(resume.getByRole('button', { name: 'Download resume (PDF)' })).toBeEnabled()
    await resume.close()
  })
})
