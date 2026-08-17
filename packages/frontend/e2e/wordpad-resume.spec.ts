import { expect, test } from '@playwright/test'

const ACTIVE_THEMES = ['winxp', 'win98'] as const

for (const theme of ACTIVE_THEMES) {
  test(`${theme} exposes the resume PDF action as the only working document command`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem('2000sme:theme', selectedTheme)
    }, theme)
    await page.goto('/#/apps/resume')

    await expect(page.locator('html')).toHaveAttribute('data-os-theme', theme)
    const download = page.getByRole('button', { name: 'Download resume (PDF)' })
    await expect(download).toBeVisible()
    await expect(download).toBeEnabled()
    await download.focus()
    await expect(download).toBeFocused()
    await expect(download).toHaveAttribute('aria-describedby', 'resume-download-help')

    await expect(page.getByRole('button', { name: 'New (unavailable in resume preview)' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Print (unavailable in resume preview)' })).toBeDisabled()
    await expect(page.getByLabel('Font')).toBeDisabled()
    await expect(page.getByLabel('Size')).toBeDisabled()
    await expect(page.getByText('Read-only resume preview').first()).toBeVisible()
  })
}

test('keeps the primary PDF action readable and touch-sized on the narrow resume route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/apps/resume')

  const download = page.getByRole('button', { name: 'Download resume (PDF)' })
  await expect(download).toBeVisible()
  const box = await download.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThanOrEqual(280)
  expect(box!.height).toBeGreaterThanOrEqual(34)
  await expect(page.locator('[aria-label="Read-only document toolbar"]')).toHaveCSS('overflow-x', 'auto')
})
