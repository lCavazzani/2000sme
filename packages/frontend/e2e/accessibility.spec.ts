import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const seriousOrCritical = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')

async function visitInTheme(page: Page, theme: 'winxp' | 'win98', path = '/') {
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem('2000sme:theme', selectedTheme)
  }, theme)
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', theme)
  await expect(page.locator('#os-theme')).toHaveAttribute('href', new RegExp(`/themes/${theme === 'winxp' ? 'xp' : '98'}\\.css$`))
}

async function expectNoSeriousOrCriticalViolations(page: Page, selector: string) {
  const results = await new AxeBuilder({ page }).include(selector).analyze()
  expect(seriousOrCritical(results.violations)).toEqual([])
}

test.describe('supported-theme accessibility regression coverage', () => {
  test('scans the Windows XP first-visit desktop and keyboard-accessible Start menu', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'winxp')
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

  test('recovers the stored Windows 98 preference and scans an opened desktop window', async ({ page }) => {
    await visitInTheme(page, 'win98')

    await page.getByRole('button', { name: 'Open Resume' }).dblclick()
    const resumeWindow = page.getByRole('dialog', { name: 'resume.md - WordPad window' })

    await expect(resumeWindow).toBeVisible()
    await expect(resumeWindow).toBeFocused()
    await expectNoSeriousOrCriticalViolations(page, '[role="dialog"]')
  })

  test('scans the direct Guestbook route and its verification status', async ({ page }) => {
    await page.route(/\/api\/guestbook(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ entries: [], page: { limit: 20, next_cursor: null } }),
      })
    })
    await visitInTheme(page, 'winxp', '/#/apps/guestbook')

    const guestbookRoute = page.getByRole('main', { name: 'Guestbook direct route' })
    await expect(guestbookRoute).toBeVisible()
    await expect(guestbookRoute.locator('h1')).toHaveText('Guestbook')
    await expect(guestbookRoute.getByLabel('Name')).toBeVisible()
    await expect(guestbookRoute.getByLabel('Message')).toBeVisible()
    await expect(guestbookRoute.getByRole('button', { name: 'Sign Guestbook' })).toBeDisabled()
    await expectNoSeriousOrCriticalViolations(page, 'main[aria-label="Guestbook direct route"]')
  })
})
