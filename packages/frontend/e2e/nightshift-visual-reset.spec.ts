import { expect, test, type Page } from '@playwright/test'

const NIGHTSHIFT_ASSETS = [
  '/pixelos/games/nightshift/nightshift-player-car-vertical-static-00.png',
  '/pixelos/games/nightshift/nightshift-player-car-vertical-damage-static-00.png',
  '/pixelos/games/nightshift/nightshift-traffic-violet-coupe-vertical-static-00.png',
  '/pixelos/games/nightshift/nightshift-traffic-amber-van-vertical-static-00.png',
  '/pixelos/games/nightshift/nightshift-twilight-city-parallax-strip-static-00.png',
  '/pixelos/games/nightshift/nightshift-twilight-roadside-strip-static-00.png',
  '/pixelos/games/nightshift/nightshift-twilight-road-reflector-tile-static-00.png',
]

async function waitForNightshiftAssets(page: Page) {
  await page.evaluate(async (sources) => {
    await Promise.all(sources.map((source) => new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve()
      image.onerror = () => reject(new Error(`Failed to load local NIGHTSHIFT asset: ${source}`))
      image.src = source
    })))
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  }, NIGHTSHIFT_ASSETS)
}

async function visitNightshift(page: Page, reduced = false) {
  await page.addInitScript((shouldReduce) => {
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
    if (shouldReduce) window.localStorage.setItem('2000sme:theme-effects', 'reduced')
  }, reduced)
  if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/apps/nightshift')
  await waitForNightshiftAssets(page)
  return page.getByRole('main', { name: 'NIGHTSHIFT.EXE direct route' })
}

test.describe('TEST-15 GAME-14 NIGHTSHIFT visual reset', () => {
  test('keeps the deterministic game semantic while rendering the new desktop hierarchy', async ({ page }) => {
    const route = await visitNightshift(page)

    await expect(route.getByRole('img', { name: /NIGHTSHIFT highway playfield/ })).toBeVisible()
    await expect(route.getByLabel('NIGHTSHIFT dashboard')).toContainText('DIST')
    await expect(route.getByLabel('NIGHTSHIFT dashboard')).toContainText('BEST')
    await expect(route.getByLabel('NIGHTSHIFT dashboard')).toContainText('SPEED')
    await expect(route.getByLabel('NIGHTSHIFT dashboard')).toContainText('HULL')
    await expect(route.getByLabel('NIGHTSHIFT dashboard')).not.toContainText('PAUSE')
    await expect(route.getByRole('button', { name: 'START SHIFT' })).toBeVisible()
    await expect(route.getByRole('button', { name: 'PAUSE' })).toBeVisible()
    await expect(route.getByText('KEYBOARD:', { exact: false })).toBeVisible()
    await expect(route.getByLabel('NIGHTSHIFT touch controls')).toBeHidden()

    await expect(route).toHaveScreenshot('nightshift-visual-reset-desktop.png', { animations: 'disabled' })
  })

  test('exposes labelled touch decks without changing direct-route lifecycle', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
    const route = await visitNightshift(page)

    await expect(route.getByLabel('NIGHTSHIFT touch controls')).toBeVisible()
    await expect(route.getByLabel('Steer controls').getByRole('button', { name: 'Steer left' })).toBeVisible()
    await expect(route.getByLabel('Steer controls').getByRole('button', { name: 'Steer right' })).toBeVisible()
    await expect(route.getByLabel('Pace controls').getByRole('button', { name: 'GO' })).toBeVisible()
    await expect(route.getByLabel('Pace controls').getByRole('button', { name: 'BRAKE' })).toBeVisible()
    await route.getByRole('button', { name: 'START SHIFT' }).click()
    await expect(route.getByText('RUNNING', { exact: true })).toBeVisible()
    await route.getByRole('button', { name: 'GO' }).click()
    await route.getByRole('button', { name: 'PAUSE' }).click()
    await expect(route.getByText('PAUSED', { exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await page.close()
  })

  test('keeps effects-reduced scenery and collision semantics readable and static', async ({ page }) => {
    const route = await visitNightshift(page, true)
    const canvas = route.getByRole('img', { name: /NIGHTSHIFT highway playfield/ })

    await expect(canvas).toBeVisible()
    await expect(route.getByText('KEYBOARD:', { exact: false })).toBeVisible()
    await expect(route).toHaveScreenshot('nightshift-visual-reset-reduced.png', { animations: 'disabled' })
    await route.getByRole('button', { name: 'START SHIFT' }).click()
    await expect(route.getByText('RUNNING', { exact: true })).toBeVisible()
    await route.getByRole('button', { name: 'PAUSE' }).click()
    await expect(route.getByText('PAUSED', { exact: true })).toBeVisible()
  })
})
