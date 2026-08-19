import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const seriousOrCritical = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')

async function visitPixelOs(page: Page, path = '/') {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function expectNoSeriousOrCriticalViolations(page: Page, selector: string) {
  const results = await new AxeBuilder({ page }).include(selector).analyze()
  expect(seriousOrCritical(results.violations)).toEqual([])
}

test.describe('PixelOS shell accessibility regression coverage', () => {
  test('scans the PixelOS desktop and keyboard-accessible Start menu', async ({ page }) => {
    await visitPixelOs(page)

    await expectNoSeriousOrCriticalViolations(page, 'main[aria-label="Desktop"]')

    const startButton = page.getByRole('button', { name: 'Start' })
    await startButton.focus()
    await page.keyboard.press('Enter')

    const startMenu = page.getByRole('navigation', { name: 'Start menu' })
    await expect(startMenu).toBeVisible()
    await expect(startMenu.getByRole('button', { name: 'My Portfolio' })).toBeFocused()
    await expectNoSeriousOrCriticalViolations(page, '#start-menu')

    await page.keyboard.press('Escape')
    await expect(startMenu).toBeHidden()
    await expect(startButton).toBeFocused()
  })

  test('scans an opened retained Resume window under PixelOS chrome', async ({ page }) => {
    await visitPixelOs(page)

    await page.getByRole('button', { name: 'Open Resume' }).dblclick()
    const resumeWindow = page.getByRole('dialog', { name: 'resume.md - WordPad window' })

    await expect(resumeWindow).toBeVisible()
    await expect(resumeWindow).toBeFocused()
    await expectNoSeriousOrCriticalViolations(page, '[role="dialog"]')
  })
})
