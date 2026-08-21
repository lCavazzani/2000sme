import { expect, test, type Page } from '@playwright/test'

async function freezeTaskbarClock(page: Page) {
  await page.addInitScript(`
    (() => {
      const NativeDate = Date
      const fixedTime = new NativeDate('2026-08-21T20:00:00.000Z').valueOf()
      class StableDate extends NativeDate {
        constructor(...args) {
          super(args.length ? args[0] : fixedTime)
        }

        static now() {
          return fixedTime
        }
      }

      window.Date = StableDate
    })()
  `)
}

async function visitReturningDesktop(page: Page) {
  await freezeTaskbarClock(page)
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto('/')
  await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
}

async function beginFreshIntro(page: Page) {
  await freezeTaskbarClock(page)
  await page.goto('/')
  await page.evaluate(() => window.sessionStorage.clear())
  await page.reload()
}

async function openApplication(page: Page, launcherLabel: string, windowLabel = launcherLabel) {
  await page.getByRole('button', { name: `Open ${launcherLabel}` }).dblclick()
  const window = page.getByRole('dialog', { name: `${windowLabel} window` })
  await expect(window).toBeVisible()
  return window
}

const stableScreenshot = { animations: 'disabled' as const, caret: 'hide' as const }

test.describe('TEST-13 PixelOS visual regression baselines', () => {
  test('captures the original optional entrance states and the entered desktop', async ({ page }) => {
    await beginFreshIntro(page)
    await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused()
    await expect(page).toHaveScreenshot('pixelos-intro-stage-1-boot.png', stableScreenshot)

    await expect(page.getByRole('button', { name: 'Enter Desktop' })).toBeVisible({ timeout: 2_500 })
    await expect(page.getByRole('button', { name: 'Enter Desktop' })).toBeFocused()
    await expect(page).toHaveScreenshot('pixelos-intro-stage-2-enter.png', stableScreenshot)

    await page.getByRole('button', { name: 'Enter Desktop' }).click()
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
    await expect(page).toHaveScreenshot('pixelos-entered-desktop.png', stableScreenshot)
  })

  test('captures reduced-effects desktop and static entrance entry', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await beginFreshIntro(page)

    await expect(page.getByRole('button', { name: 'Enter Desktop' })).toBeVisible()
    await expect(page.locator('main[data-intro-stage="boot"]')).toHaveCount(0)
    await expect(page).toHaveScreenshot('pixelos-intro-reduced-effects.png', stableScreenshot)

    await page.getByRole('button', { name: 'Enter Desktop' }).click()
    await expect(page.getByRole('main', { name: 'Desktop' })).toBeVisible()
    await expect(page).toHaveScreenshot('pixelos-desktop-reduced-effects.png', stableScreenshot)
    await page.close()
  })

  test('captures desktop, Start menu, active/inactive chrome, and taskbar lifecycle', async ({ page }) => {
    await visitReturningDesktop(page)
    await expect(page).toHaveScreenshot('pixelos-desktop-effects-on.png', stableScreenshot)

    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('navigation', { name: 'Start menu' })).toBeVisible()
    await expect(page).toHaveScreenshot('pixelos-start-menu.png', stableScreenshot)
    await page.keyboard.press('Escape')

    await openApplication(page, 'MY MACHINE')
    await page.getByRole('button', { name: 'Start' }).click()
    await page.getByRole('navigation', { name: 'Start menu' }).getByRole('button', { name: 'RESUME.PDF' }).click()
    await expect(page.getByRole('dialog', { name: 'RESUME.PDF - WORDPAD window' })).toBeVisible()
    await expect(page).toHaveScreenshot('pixelos-active-inactive-windows-and-taskbar.png', stableScreenshot)
  })

  test('captures the complete PixelOS application family', async ({ page }) => {
    await visitReturningDesktop(page)

    const machine = await openApplication(page, 'MY MACHINE')
    await expect(machine).toHaveScreenshot('pixelos-my-machine.png', stableScreenshot)
    await machine.getByRole('button', { name: 'Close' }).click()

    const gallery = await openApplication(page, 'PIXEL GALLERY')
    await expect(gallery).toHaveScreenshot('pixelos-gallery.png', stableScreenshot)
    await gallery.getByRole('button', { name: 'Close' }).click()

    const pet = await openApplication(page, 'DESKTOP PET')
    await expect(pet).toHaveScreenshot('pixelos-mittens.png', stableScreenshot)
    await pet.getByRole('button', { name: 'Close' }).click()

    const readme = await openApplication(page, 'README.TXT')
    await expect(readme).toHaveScreenshot('pixelos-readme.png', stableScreenshot)
    await readme.getByRole('button', { name: 'Close' }).click()

    const about = await openApplication(page, 'ABOUT PIXELOS')
    await expect(about).toHaveScreenshot('pixelos-about.png', stableScreenshot)
    await about.getByRole('button', { name: 'Close' }).click()

    const resume = await openApplication(page, 'RESUME.PDF', 'RESUME.PDF - WORDPAD')
    await expect(resume).toHaveScreenshot('pixelos-resume.png', stableScreenshot)
    await resume.getByRole('button', { name: 'Close' }).click()

    const minesweeper = await openApplication(page, 'MINESWEEPER.EXE')
    await expect(minesweeper).toHaveScreenshot('pixelos-minesweeper.png', stableScreenshot)
  })
})
