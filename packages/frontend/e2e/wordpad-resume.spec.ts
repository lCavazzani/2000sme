import { expect, test } from '@playwright/test'

test('PixelOS exposes the README.TXT PDF action as the only working document command', async ({ page }) => {
  await page.goto('/#/apps/resume')

  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
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

test('keeps the primary PDF action readable and touch-sized on the narrow README.TXT route', async ({ page }) => {
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

test('keeps the persistent PDF action bottom-left inside the desktop Resume window while the document scrolls', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open Resume' }).dblclick()

  const resumeWindow = page.getByRole('dialog', { name: 'resume.md - WordPad window' })
  const persistentDownload = resumeWindow.getByRole('button', {
    name: 'Download resume (PDF) — persistent action',
  })
  const documentArea = resumeWindow.locator('[data-resume-document-area]')

  await expect(resumeWindow).toBeVisible()
  await expect(persistentDownload).toBeVisible()
  await expect(persistentDownload).toHaveCSS('position', 'absolute')
  await expect(documentArea).toHaveCSS('overflow-y', 'auto')

  const beforeScroll = await persistentDownload.boundingBox()
  expect(beforeScroll).not.toBeNull()

  await documentArea.evaluate((area) => {
    area.scrollTop = area.scrollHeight
  })

  const afterScroll = await persistentDownload.boundingBox()
  const windowBox = await resumeWindow.boundingBox()
  expect(afterScroll).not.toBeNull()
  expect(windowBox).not.toBeNull()
  expect(afterScroll!.x).toBeCloseTo(beforeScroll!.x, 0)
  expect(afterScroll!.y).toBeCloseTo(beforeScroll!.y, 0)
  expect(afterScroll!.x).toBeGreaterThanOrEqual(windowBox!.x)
  expect(afterScroll!.y).toBeGreaterThan(windowBox!.y)

  await persistentDownload.focus()
  await expect(persistentDownload).toBeFocused()
})
