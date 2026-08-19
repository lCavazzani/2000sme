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

test.describe('PixelOS accessibility regression coverage', () => {
  test('scans the PixelOS desktop and keyboard-accessible Start menu', async ({ page }) => {
    await visitPixelOs(page)

    await expectNoSeriousOrCriticalViolations(page, 'main[aria-label="Desktop"]')

    const startButton = page.getByRole('button', { name: 'Start' })
    await startButton.focus()
    await page.keyboard.press('Enter')

    const startMenu = page.getByRole('navigation', { name: 'Start menu' })
    await expect(startMenu).toBeVisible()
    await expect(startMenu.getByRole('button', { name: 'MY MACHINE' })).toBeFocused()
    await expectNoSeriousOrCriticalViolations(page, '#start-menu')

    await page.keyboard.press('Escape')
    await expect(startMenu).toBeHidden()
    await expect(startButton).toBeFocused()
  })

  test('scans an opened retained README.TXT window', async ({ page }) => {
    await visitPixelOs(page)

    await page.getByRole('button', { name: 'Open README.TXT' }).dblclick()
    const resumeWindow = page.getByRole('dialog', { name: 'README.TXT - WORDPAD window' })

    await expect(resumeWindow).toBeVisible()
    await expect(resumeWindow).toBeFocused()
    await expectNoSeriousOrCriticalViolations(page, '[role="dialog"]')
  })

  test('returns a retired Guestbook route to the accessible PixelOS desktop', async ({ page }) => {
    await visitPixelOs(page, '/#/apps/guestbook')

    const desktop = page.getByRole('main', { name: 'Desktop' })
    await expect(desktop).toBeVisible()
    await expect(page.getByRole('main', { name: 'Visitor Scrapbook direct route' })).toHaveCount(0)
    await expectNoSeriousOrCriticalViolations(page, 'main[aria-label="Desktop"]')
  })
})


test.describe('PXOS-5 effects accessibility', () => {
  test('keeps the decorative sprite pointer-transparent and preserves desktop launcher interaction', async ({ page }) => {
    await visitPixelOs(page)

    const sprite = page.locator('.pixelos-desktop-sprite')
    await expect(sprite).toHaveAttribute('aria-hidden', 'true')
    await expect(sprite).toHaveCSS('pointer-events', 'none')

    await page.getByRole('button', { name: 'Open MY MACHINE' }).dblclick()
    await expect(page.getByRole('dialog', { name: 'MY MACHINE window' })).toBeVisible()
  })

  test('keeps PixelOS effects static when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await visitPixelOs(page)

    await expect(page.locator('html')).toHaveAttribute('data-theme-effects', 'reduced')
    await expect(page.locator('.pixelos-desktop-sprite')).toHaveCSS('animation-name', 'none')

    await page.getByRole('button', { name: 'Open MY MACHINE' }).dblclick()
    await expect(page.locator('.pixelos-cursor-blink')).toHaveCSS('animation-name', 'none')
    await expectNoSeriousOrCriticalViolations(page, '[role="dialog"]')
  })
})
