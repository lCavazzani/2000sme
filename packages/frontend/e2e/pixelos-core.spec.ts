import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/') {
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function openDesktopApplication(page: Page, launcherLabel: string, dialogLabel = launcherLabel) {
  const launcher = page.getByRole('button', { name: `Open ${launcherLabel}` })
  await launcher.dblclick()
  return page.getByRole('dialog', { name: `${dialogLabel} window` })
}

test.describe('TEST-11 PixelOS core visual and OS-behavior gate', () => {
  test('records the reference-led desktop, taskbar, Start menu, window chrome, and effect contract', async ({ page }, testInfo) => {
    await visitPixelOs(page)

    const desktop = page.getByRole('main', { name: 'Desktop' })
    const taskbar = page.locator('footer[aria-label="PixelOS taskbar"]')
    const sprite = page.locator('.pixelos-desktop-sprite')

    await expect(desktop).toHaveCSS('background-image', /dda42e57-923b-4342-b2b1-8ad755273c99\.jpg/)
    await expect(desktop).toHaveCSS('font-family', /Pixelify Sans/)
    await expect(taskbar).toHaveCSS('position', 'fixed')
    await expect(taskbar).toHaveCSS('height', '36px')
    await expect(sprite).toBeVisible()
    await expect(sprite).toHaveAttribute('aria-hidden', 'true')
    await expect(sprite).toHaveCSS('pointer-events', 'none')

    await page.getByRole('button', { name: 'Start' }).click()
    const startMenu = page.getByRole('navigation', { name: 'Start menu' })
    await expect(startMenu).toBeVisible()
    await expect(startMenu).toHaveCSS('grid-template-columns', /26px/)
    await expect(startMenu.getByText('PIXELOS 2.0')).toBeVisible()
    await expect(startMenu.getByRole('button', { name: 'MY MACHINE' })).toBeVisible()
    await expect(startMenu.getByRole('button', { name: 'README.TXT' })).toBeVisible()

    await testInfo.attach('pixelos-desktop-and-start-menu', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
  })

  test('preserves focus, active and inactive chrome, taskbar lifecycle, drag, resize, and maximize behavior', async ({ page }) => {
    await visitPixelOs(page)

    const machine = await openDesktopApplication(page, 'MY MACHINE')
    await page.getByRole('button', { name: 'Start' }).click()
    await page.getByRole('navigation', { name: 'Start menu' }).getByRole('button', { name: 'RESUME.PDF' }).click()
    const readme = page.getByRole('dialog', { name: 'RESUME.PDF - WORDPAD window' })
    const machineTitleBar = machine.locator('.title-bar')
    const readmeTitleBar = readme.locator('.title-bar')

    await expect(readme).toBeFocused()
    await expect(readme).toHaveAttribute('data-window-active', 'true')
    await expect(machine).toHaveAttribute('data-window-active', 'false')
    await expect(readmeTitleBar).toHaveCSS('background-color', 'rgb(255, 44, 229)')
    await expect(machineTitleBar).toHaveCSS('background-color', 'rgb(59, 45, 94)')

    await readme.getByRole('button', { name: 'Minimize' }).click()
    await expect(readme).toBeHidden()
    const readmeTask = page.getByRole('button', { name: 'RESUME.PDF - WORDPAD' })
    await expect(readmeTask).toBeVisible()
    await readmeTask.click()
    await expect(readme).toBeVisible()
    await expect(readme).toHaveAttribute('data-window-active', 'true')

    const maximize = readme.getByRole('button', { name: 'Maximize' })
    await maximize.click()
    await expect(readme.getByRole('button', { name: 'Restore' })).toBeVisible()
    await readme.getByRole('button', { name: 'Restore' }).click()
    await expect(readme.getByRole('button', { name: 'Maximize' })).toBeVisible()

    const readmeFrame = readme.locator('xpath=..')
    const beforeDrag = await readmeFrame.boundingBox()
    const titleBox = await readmeTitleBar.boundingBox()
    expect(beforeDrag).not.toBeNull()
    expect(titleBox).not.toBeNull()

    await page.mouse.move(titleBox!.x + 42, titleBox!.y + 12)
    await page.mouse.down()
    await page.mouse.move(titleBox!.x + 72, titleBox!.y + 28)
    await page.mouse.up()
    const afterDrag = await readmeFrame.boundingBox()
    expect(afterDrag).not.toBeNull()
    expect(afterDrag!.x).toBeGreaterThan(beforeDrag!.x)

    const beforeResize = await readmeFrame.boundingBox()
    expect(beforeResize).not.toBeNull()

    await page.mouse.move(beforeResize!.x + beforeResize!.width - 2, beforeResize!.y + beforeResize!.height - 2)
    await page.mouse.down()
    await page.mouse.move(beforeResize!.x + beforeResize!.width + 40, beforeResize!.y + beforeResize!.height + 30)
    await page.mouse.up()
    const afterResize = await readmeFrame.boundingBox()
    expect(afterResize).not.toBeNull()
    expect(afterResize!.width).toBeGreaterThan(beforeResize!.width)
    expect(afterResize!.height).toBeGreaterThan(beforeResize!.height)
  })

  test('keeps Start-menu keyboard focus and direct-route fallback behavior intact', async ({ page }) => {
    await visitPixelOs(page)

    const start = page.getByRole('button', { name: 'Start' })
    await start.focus()
    await page.keyboard.press('Enter')
    const startMenu = page.getByRole('navigation', { name: 'Start menu' })
    await expect(startMenu.getByRole('button', { name: 'MY MACHINE' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(startMenu).toBeHidden()
    await expect(start).toBeFocused()

    await visitPixelOs(page, '/#/apps/guestbook')
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
    await expect(page.getByRole('main', { name: 'Visitor Scrapbook direct route' })).toHaveCount(0)
  })

  test('uses the touch-friendly mobile launcher and static effects under user preferences', async ({ browser }) => {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile)
    await expect(mobile.locator('footer[aria-label="PixelOS taskbar"]')).toHaveCSS('display', 'none')
    await expect(mobile.getByRole('navigation', { name: 'Portfolio applications' })).toBeVisible()
    await expect(mobile.getByRole('link', { name: 'My Machine' })).toBeVisible()
    await mobile.close()

    const reduced = await browser.newPage()
    await reduced.emulateMedia({ reducedMotion: 'reduce' })
    await visitPixelOs(reduced)
    await expect(reduced.locator('html')).toHaveAttribute('data-theme-effects', 'reduced')
    await expect(reduced.locator('.pixelos-desktop-sprite')).toHaveCSS('animation-name', 'none')
    await reduced.close()
  })
})
