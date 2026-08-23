import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const applications = [
  { id: 'my-computer', label: 'MY MACHINE', title: 'MY MACHINE', path: '#/apps/my-computer', mobileLabel: 'My Machine' },
  { id: 'gallery', label: 'PIXEL GALLERY', title: 'PIXEL GALLERY', path: '#/apps/gallery', mobileLabel: 'Pixel Gallery' },
  { id: 'pet', label: 'DESKTOP PET', title: 'DESKTOP PET', path: '#/apps/pet', mobileLabel: 'Desktop Pet' },
  { id: 'notepad', label: 'README.TXT', title: 'README.TXT', path: '#/apps/notepad', mobileLabel: 'README.TXT' },
  { id: 'about', label: 'ABOUT PIXELOS', title: 'ABOUT PIXELOS', path: '#/apps/about', mobileLabel: 'About PixelOS' },
  { id: 'minesweeper', label: 'MINESWEEPER.EXE', title: 'MINESWEEPER.EXE', path: '#/apps/minesweeper', mobileLabel: 'Minesweeper' },
  { id: 'nightshift', label: 'NIGHTSHIFT.EXE', title: 'NIGHTSHIFT.EXE', path: '#/apps/nightshift', mobileLabel: 'Nightshift' },
  { id: 'resume', label: 'RESUME.PDF', title: 'RESUME.PDF - WORDPAD', path: '#/apps/resume', mobileLabel: 'Resume PDF' },
] as const

const suppliedApplicationIcons = {
  'my-computer': '/pixelos/icons/pixelos-my-machine-static-00.png',
  gallery: '/pixelos/icons/pixelos-gallery-static-00.png',
  pet: '/pixelos/icons/pixelos-desktop-pet-static-00.png',
  notepad: '/pixelos/icons/pixelos-readme-static-00.png',
  about: '/pixelos/icons/pixelos-about-me-static-00.png',
  resume: '/pixelos/icons/pixelos-resume-static-00.png',
} as const

async function visitPixelOs(page: Page, path = '/') {
  await page.goto('/')
  await page.evaluate(() => {
    window.sessionStorage.clear()
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
  })
  await page.reload()
  if (path !== '/') await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function expectNoSeriousOrCriticalViolations(page: Page, selector: string) {
  const results = await new AxeBuilder({ page }).include(selector).analyze()
  const seriousOrCritical = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(seriousOrCritical).toEqual([])
}

test.describe('TEST-12 PixelOS application journeys', () => {
  test('launches every application from the desktop and resolves every direct route', async ({ page }) => {
    for (const application of applications) {
      await visitPixelOs(page)
      await page.getByRole('button', { name: `Open ${application.label}` }).dblclick()
      await expect(page.getByRole('dialog', { name: `${application.title} window` })).toBeVisible()

      await visitPixelOs(page, `/${application.path}`)
      const route = page.getByRole('main', { name: `${application.label} direct route` })
      await expect(route).toBeVisible()
      await expect(route.getByRole('button', { name: 'Open desktop' })).toBeVisible()
    }
  })

  test('keeps supplied images decorative and every direct application route free of serious accessibility violations', async ({ page }) => {
    await visitPixelOs(page)

    for (const [applicationId, iconPath] of Object.entries(suppliedApplicationIcons)) {
      const icon = page.locator(`[data-window-launcher="${applicationId}"]`).first().locator('img')
      await expect(icon).toHaveAttribute('src', new RegExp(`${iconPath}$`))
      await expect(icon).toHaveAttribute('alt', '')
    }

    await expect(page.locator('.pixelos-desktop-sprite')).toHaveAttribute('alt', '')
    await expect(page.locator('.pixelos-desktop-sprite')).toHaveAttribute('aria-hidden', 'true')

    for (const application of applications) {
      await visitPixelOs(page, `/${application.path}`)
      await expectNoSeriousOrCriticalViolations(page, 'main')
    }
  })

  test('preserves keyboard focus, reduced-effects rendering, stale-route fallback, and narrow launcher routes', async ({ browser }) => {
    const keyboardPage = await browser.newPage()
    await visitPixelOs(keyboardPage)

    const start = keyboardPage.getByRole('button', { name: 'Start' })
    await start.focus()
    await keyboardPage.keyboard.press('Enter')
    const startMenu = keyboardPage.getByRole('navigation', { name: 'Start menu' })
    await expect(startMenu.getByRole('button', { name: 'MY MACHINE' })).toBeFocused()
    await keyboardPage.keyboard.press('Escape')
    await expect(startMenu).toBeHidden()
    await expect(start).toBeFocused()
    await keyboardPage.close()

    const reducedPage = await browser.newPage()
    await reducedPage.emulateMedia({ reducedMotion: 'reduce' })
    await visitPixelOs(reducedPage)
    await expect(reducedPage.locator('html')).toHaveAttribute('data-theme-effects', 'reduced')
    await expect(reducedPage.locator('.pixelos-desktop-sprite')).toHaveCSS('animation-name', 'none')
    await reducedPage.close()

    const staleRoutePage = await browser.newPage()
    await visitPixelOs(staleRoutePage, '/#/apps/guestbook')
    await expect(staleRoutePage.getByRole('main', { name: 'Desktop' })).toBeVisible()
    await expect(staleRoutePage.getByRole('main', { name: 'Visitor Scrapbook direct route' })).toHaveCount(0)
    await staleRoutePage.close()

    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobilePage)
    const launcher = mobilePage.getByRole('navigation', { name: 'Portfolio applications' })
    await expect(launcher).toBeVisible()
    for (const application of applications) {
      await expect(launcher.getByRole('link', { name: application.mobileLabel })).toBeVisible()
    }
    await mobilePage.close()
  })
})
