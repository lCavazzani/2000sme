import { expect, test, type Page } from '@playwright/test'

const ACTIVE_THEMES = [
  { id: 'winxp', stylesheet: '/themes/xp.css' },
  { id: 'win98', stylesheet: '/themes/98.css' },
] as const

const CORE_APPLICATIONS = [
  { shortcut: 'Alt+1', windowName: 'My Portfolio window' },
  { shortcut: 'Alt+3', windowName: 'resume.md - WordPad window' },
  { shortcut: 'Alt+4', windowName: 'Visitor Scrapbook window' },
  { shortcut: 'Alt+5', windowName: 'About Me window' },
  { shortcut: 'Alt+6', windowName: 'Appearance & Themes window' },
] as const

async function stubGuestbook(page: Page) {
  await page.route(/\/api\/guestbook(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ entries: [], page: { limit: 20, next_cursor: null } }),
    })
  })
}

async function visitInTheme(page: Page, theme: (typeof ACTIVE_THEMES)[number]['id']) {
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem('2000sme:theme', selectedTheme)
  }, theme)
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', theme)
  await expect(page.locator('link[data-os-theme]')).toHaveCount(1)
  await expect(page.locator('#os-theme-overrides')).toHaveCount(1)
}

test.describe('supported theme compatibility', () => {
  for (const theme of ACTIVE_THEMES) {
    test(`${theme.id} opens every core desktop application without changing its content path`, async ({ page }) => {
      await stubGuestbook(page)
      await visitInTheme(page, theme.id)

      for (const application of CORE_APPLICATIONS) {
        await page.keyboard.press(application.shortcut)
        await expect(page.getByRole('dialog', { name: application.windowName })).toBeVisible()
      }

      await page.getByRole('button', { name: 'Start' }).click()
      const startMenu = page.getByRole('navigation', { name: 'Start menu' })
      const firstStartMenuItem = startMenu.getByRole('button', { name: 'My Portfolio' })
      const myComputerMenuItem = startMenu.getByRole('button', { name: 'My Computer' })
      await expect(firstStartMenuItem).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(myComputerMenuItem).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('dialog', { name: 'My Computer window' })).toBeVisible()

      await expect(page.locator('html')).toHaveAttribute('data-os-theme', theme.id)
      await expect(page.locator('#os-theme')).toHaveAttribute('href', new RegExp(`${theme.stylesheet}$`))
      await expect(page.locator('link[data-os-theme]')).toHaveCount(1)
    })

    test(`${theme.id} renders distinct maximize and restore control glyphs`, async ({ page }) => {
      await visitInTheme(page, theme.id)
      await page.keyboard.press('Alt+1')

      const maximizeControl = page.getByRole('button', { name: 'Maximize' })
      await expect(maximizeControl).toBeVisible()
      await expect(maximizeControl).toHaveCSS('background-image', /url\(/)

      await maximizeControl.click()
      const restoreControl = page.getByRole('button', { name: 'Restore' })
      await expect(restoreControl).toBeVisible()
      await expect(restoreControl).toHaveCSS('background-image', /url\(/)
    })

    test(`${theme.id} presents an accessible icon-led Start menu with its intended layout`, async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 })
      await visitInTheme(page, theme.id)
      await page.getByRole('button', { name: 'Start' }).click()

      const startMenu = page.getByRole('navigation', { name: 'Start menu' })
      const applicationsGroup = startMenu.getByRole('group', { name: 'Applications' })
      const profileGroup = startMenu.getByRole('group', { name: 'Profile & settings' })
      await expect(applicationsGroup).toBeVisible()
      await expect(profileGroup).toBeVisible()
      await expect(applicationsGroup.getByRole('button')).toHaveCount(4)
      await expect(profileGroup.getByRole('button')).toHaveCount(3)
      await expect(applicationsGroup.getByRole('button', { name: 'My Portfolio' })).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(applicationsGroup.getByRole('button', { name: 'My Computer' })).toBeFocused()

      const applicationsBox = await applicationsGroup.boundingBox()
      const profileBox = await profileGroup.boundingBox()
      expect(applicationsBox).not.toBeNull()
      expect(profileBox).not.toBeNull()
      expect(await startMenu.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)

      const portfolioImages = applicationsGroup.getByRole('button', { name: 'My Portfolio' }).locator('img')
      await expect(portfolioImages.nth(theme.id === 'win98' ? 1 : 0)).toHaveAttribute(
        'src',
        new RegExp(`/theme-assets/${theme.id}/portfolio\\.ico$`),
      )

      if (theme.id === 'win98') {
        expect(profileBox!.y).toBeGreaterThan(applicationsBox!.y)
        await expect(startMenu).toHaveCSS('overflow-x', 'hidden')
        return
      }

      expect(profileBox!.x).toBeGreaterThan(applicationsBox!.x)
      await page.keyboard.press('Escape')
      await page.setViewportSize({ width: 760, height: 600 })
      await page.getByRole('button', { name: 'Start' }).click()
      const narrowApplicationsBox = await applicationsGroup.boundingBox()
      const narrowProfileBox = await profileGroup.boundingBox()
      expect(narrowApplicationsBox).not.toBeNull()
      expect(narrowProfileBox).not.toBeNull()
      expect(narrowProfileBox!.y).toBeGreaterThan(narrowApplicationsBox!.y)
      await expect(startMenu).toHaveCSS('overflow-x', 'hidden')
    })

    test(`${theme.id} exposes the same responsive primary routes`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await visitInTheme(page, theme.id)

      const mobileLauncher = page.getByRole('navigation', { name: 'Portfolio applications' })
      await expect(mobileLauncher).toBeVisible()
      await expect(mobileLauncher.getByRole('link')).toHaveCount(7)
      await expect(mobileLauncher.getByRole('link', { name: /Portfolio/ })).toBeVisible()
      await expect(mobileLauncher.getByRole('link', { name: /Resume/ })).toBeVisible()
      await expect(mobileLauncher.getByRole('link', { name: /Scrapbook/ })).toBeVisible()
      await expect(mobileLauncher.getByRole('link', { name: /About/ })).toBeVisible()
      await expect(mobileLauncher.getByRole('link', { name: /Themes/ })).toBeVisible()
    })
  }

  test('gives Windows 98 a sharp, beveled taskbar and Start-menu grammar', async ({ page }) => {
    await visitInTheme(page, 'win98')

    const startButton = page.getByRole('button', { name: 'Start' })
    const taskbar = page.locator('footer[aria-label="Windows taskbar"]')
    await expect(startButton).toHaveCSS('border-radius', '0px')
    await expect(taskbar).toHaveCSS('border-top-width', '2px')

    await startButton.click()
    const startMenu = page.getByRole('navigation', { name: 'Start menu' })
    await expect(startMenu).toHaveCSS('border-radius', '0px')
    await expect(startMenu.getByRole('button', { name: 'My Portfolio' })).toBeVisible()
  })

  test('keeps the Windows 7 stylesheet available but dormant outside the release UI', async ({ page, request }) => {
    await page.goto('/')

    await expect(page.getByRole('radio', { name: /Windows 7/ })).toHaveCount(0)
    await expect(page.locator('link[href$="/themes/7.css"]')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveAttribute('data-os-theme', 'win7')
    expect((await request.get('/themes/7.css')).status()).toBe(200)
  })

  test('switches from XP to Windows 98 without resetting open windows or duplicating theme stylesheets', async ({ page }) => {
    await stubGuestbook(page)
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Open Resume' })).toBeVisible()
    await page.getByRole('button', { name: 'Open Resume' }).dblclick()
    await page.getByRole('button', { name: 'Open Control Panel' }).dblclick()
    const resumeWindow = page.getByRole('dialog', { name: 'resume.md - WordPad window' })
    const appearanceWindow = page.getByRole('dialog', { name: 'Appearance & Themes window' })

    await expect(resumeWindow).toBeVisible()
    await expect(appearanceWindow).toBeVisible()
    await page.getByText('Windows 98', { exact: true }).click()

    await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'win98')
    await expect(page.locator('#os-theme')).toHaveAttribute('href', /\/themes\/98\.css$/)
    await expect(page.locator('link[data-os-theme]')).toHaveCount(1)
    await expect(page.locator('#os-theme-overrides')).toHaveCount(1)
    await expect(resumeWindow).toBeVisible()
    await expect(appearanceWindow).toBeVisible()
  })
})
