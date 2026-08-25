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

async function visitPixelOs(page: Page, path = '/') {
  await freezeTaskbarClock(page)
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

function localOnly(url: string) {
  return url.startsWith('http://localhost:') || url.startsWith('http://127.0.0.1:')
}

test.describe('TEST-21 Quiet Technical Desk whole-system integrity', () => {
  test('preserves Signal Ridge desktop hierarchy, protected launcher zones, steel/cool chrome, cyan focus, and lifecycle', async ({ page }) => {
    await visitPixelOs(page)
    const desktop = page.getByRole('main', { name: 'Desktop' })
    const nap = desktop.locator('.pixelos-desktop-nap')

    await expect(desktop).toHaveCSS('background-color', 'rgb(23, 26, 42)')
    await expect(desktop).toHaveCSS('background-image', /pixelos-signal-ridge-wallpaper-640x360\.png/)
    await expect(nap).toHaveAttribute('src', '/pixelos/details/pixelos-grey-tabby-nap-32.gif')
    await expect(nap).toHaveAttribute('alt', '')
    await expect(nap).toHaveAttribute('aria-hidden', 'true')
    await expect(nap).toHaveCSS('pointer-events', 'none')
    await expect(nap).toHaveCSS('width', '32px')
    await expect(nap).toHaveCSS('height', '32px')

    const machineLauncher = page.getByRole('button', { name: 'Open MY MACHINE' })
    await machineLauncher.focus()
    await expect(machineLauncher).toHaveCSS('outline-color', 'rgb(77, 227, 208)')
    await machineLauncher.dblclick()
    const machine = page.getByRole('dialog', { name: 'MY MACHINE window' })
    await expect(machine).toHaveAttribute('data-window-active', 'true')
    await expect(machine.locator('[class*="titleBar"]')).toHaveCSS('background-color', 'rgb(79, 86, 111)')

    await page.getByRole('button', { name: 'Open PIXEL GALLERY' }).dblclick()
    const gallery = page.getByRole('dialog', { name: 'PIXEL GALLERY window' })
    await expect(gallery).toHaveAttribute('data-window-active', 'true')
    await expect(machine).toHaveAttribute('data-window-active', 'false')
    await expect(machine.locator('[class*="titleBar"]')).toHaveCSS('background-color', 'rgb(48, 53, 74)')
    await expect(gallery.locator('[class*="titleBar"]')).toHaveCSS('background-color', 'rgb(79, 86, 111)')
  })

  test('keeps reduced and failure fallbacks readable, removes the narrow nap, and preserves direct-route wallpaper', async ({ browser }) => {
    const reduced = await browser.newPage({ viewport: { width: 1280, height: 760 } })
    await freezeTaskbarClock(reduced)
    await reduced.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await reduced.goto('/')
    const desktop = reduced.getByRole('main', { name: 'Desktop' })
    const nap = desktop.locator('.pixelos-desktop-nap')
    await expect(reduced.locator('html')).toHaveAttribute('data-theme-effects', 'reduced')
    await expect(nap).toHaveAttribute('src', '/pixelos/details/pixelos-grey-tabby-nap-00.png')
    await expect(desktop).toHaveCSS('background-color', 'rgb(23, 26, 42)')
    await expect(desktop).toHaveScreenshot('quiet-technical-desk-reduced-desktop.png', { animations: 'disabled' })
    await reduced.close()

    const narrow = await browser.newPage({ viewport: { width: 899, height: 844 } })
    await narrow.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
    await narrow.goto('/')
    await expect(narrow.getByRole('main', { name: 'Desktop' }).locator('.pixelos-desktop-nap')).toBeHidden()
    expect(await narrow.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await narrow.close()

    const failure = await browser.newPage()
    await failure.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
    await failure.route('**/pixelos/details/pixelos-grey-tabby-nap-32.gif', (route) => route.abort())
    await failure.goto('/')
    await expect(failure.getByRole('main', { name: 'Desktop' }).locator('.pixelos-desktop-nap')).toHaveAttribute(
      'src',
      '/pixelos/details/pixelos-grey-tabby-nap-00.png',
    )
    await failure.close()

    const direct = await browser.newPage()
    await direct.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
    await direct.goto('/#/apps/gallery')
    await expect(direct.getByRole('main', { name: 'PIXEL GALLERY direct route' })).toHaveCSS(
      'background-image',
      /pixelos-signal-ridge-wallpaper-640x360\.png/,
    )
    await direct.close()
  })

  test('keeps exactly one static Gallery peek and confines the Desktop Pet paw to local Pick microcopy without external requests', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await visitPixelOs(page, '/#/apps/gallery')
    const gallery = page.getByRole('main', { name: 'PIXEL GALLERY direct route' })
    const peek = gallery.locator('img[src$="pixelos-grey-tabby-peek-00.png"]')
    await expect(peek).toHaveCount(1)
    await expect(peek).toHaveAttribute('alt', '')
    await expect(peek).toHaveAttribute('aria-hidden', 'true')
    await expect(peek).toHaveCSS('pointer-events', 'none')
    await expect(gallery).toHaveScreenshot('quiet-technical-desk-gallery-direct.png', { animations: 'disabled' })

    await page.addInitScript(() => window.localStorage.setItem('2000sme:effects', 'reduced'))
    await page.goto('/?test-effects=reduced#/apps/pet')
    const pet = page.getByRole('main', { name: 'DESKTOP PET direct route' })
    await expect(page.locator('html')).toHaveAttribute('data-theme-effects', 'reduced')
    await expect(pet.locator('img[src$="pixelos-grey-tabby-paw-00.png"]')).toHaveCount(0)
    await pet.getByRole('button', { name: 'TREAT MITTENS' }).click()
    const paw = pet.locator('img[src$="pixelos-grey-tabby-paw-00.png"]')
    await expect(paw).toHaveCount(1)
    await expect(paw).toHaveAttribute('alt', '')
    await expect(paw).toHaveAttribute('aria-hidden', 'true')
    await expect(paw).toHaveCSS('width', '16px')
    await expect(paw).toHaveCSS('height', '16px')
    await expect(paw).toHaveCSS('image-rendering', 'pixelated')
    await expect(paw.locator('xpath=ancestor::button')).toHaveCount(0)
    await expect(pet.getByText(/orange cat|moon|heart/i)).toHaveCount(0)
    await expect(pet).toHaveScreenshot('quiet-technical-desk-pet-pick.png', { animations: 'disabled' })
    expect(requests.filter((url) => !localOnly(url))).toEqual([])
  })
})
