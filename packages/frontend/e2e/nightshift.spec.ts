import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/') {
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function openNightshift(page: Page) {
  await page.getByRole('button', { name: 'Open NIGHTSHIFT.EXE' }).dblclick()
  return page.getByRole('dialog', { name: 'NIGHTSHIFT.EXE window' })
}

test.describe('GAME-11 NIGHTSHIFT local MVP wrapper', () => {
  test('launches through PixelOS with semantic HUD values, touch controls, and local-only guide settings', async ({ page }) => {
    await visitPixelOs(page)
    const gameWindow = await openNightshift(page)

    await expect(gameWindow.getByRole('heading', { name: 'NIGHTSHIFT.EXE' })).toBeVisible()
    await expect(gameWindow.getByRole('img', { name: /NIGHTSHIFT highway playfield/ })).toBeVisible()
    await expect(gameWindow.getByRole('button', { name: 'START SHIFT' })).toBeVisible()
    await expect(gameWindow.getByRole('button', { name: 'LEFT' })).toBeVisible()
    await expect(gameWindow.getByRole('button', { name: 'RIGHT' })).toBeVisible()
    await expect(gameWindow.getByRole('button', { name: 'GO' })).toBeVisible()
    await expect(gameWindow.getByRole('button', { name: 'BRAKE' })).toBeVisible()
    await expect(gameWindow.getByLabel('NIGHTSHIFT HUD')).toContainText('DIST')
    await expect(gameWindow.getByLabel('NIGHTSHIFT HUD')).toContainText('BEST')
    await expect(gameWindow.getByLabel('NIGHTSHIFT HUD')).toContainText('SPEED')
    await expect(gameWindow.getByLabel('NIGHTSHIFT HUD')).toContainText('PAUSE')

    await gameWindow.getByRole('button', { name: 'START SHIFT' }).click()
    await expect(gameWindow.getByText('RUNNING', { exact: true })).toBeVisible()
    await gameWindow.getByRole('button', { name: 'PAUSE / RESUME' }).click()
    await expect(gameWindow.getByText('PAUSED', { exact: true })).toBeVisible()
    await gameWindow.getByRole('button', { name: 'HIDE LOCAL GUIDE' }).click()
    await expect(gameWindow.getByRole('button', { name: 'SHOW LOCAL GUIDE' })).toBeVisible()

    await page.reload()
    await expect(gameWindow.getByRole('button', { name: 'SHOW LOCAL GUIDE' })).toBeVisible()
  })

  test('supports focused keyboard driving without a global input listener', async ({ page }) => {
    await visitPixelOs(page)
    const gameWindow = await openNightshift(page)
    const canvas = gameWindow.getByRole('img', { name: /NIGHTSHIFT highway playfield/ })

    await canvas.focus()
    await page.keyboard.press('Enter')
    await expect(gameWindow.getByText('RUNNING', { exact: true })).toBeVisible()
    await page.keyboard.press('ArrowUp')
    await expect(gameWindow.getByLabel('NIGHTSHIFT HUD')).toContainText('BOOST')
    await page.keyboard.press('p')
    await expect(gameWindow.getByText('PAUSED', { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(gameWindow.getByText('RUNNING', { exact: true })).toBeVisible()
  })

  test('resolves directly and contains the logical Canvas in a narrow viewport', async ({ browser }) => {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile, '/#/apps/nightshift')

    const directRoute = mobile.getByRole('main', { name: 'NIGHTSHIFT.EXE direct route' })
    await expect(directRoute).toBeVisible()
    await expect(directRoute.getByRole('img', { name: /NIGHTSHIFT highway playfield/ })).toBeVisible()
    await directRoute.getByRole('button', { name: 'START SHIFT' }).click()
    await expect(directRoute.getByText('RUNNING', { exact: true })).toBeVisible()
    await directRoute.getByRole('button', { name: 'PAUSE / RESUME' }).click()
    await expect(directRoute.getByText('PAUSED', { exact: true })).toBeVisible()
    await directRoute.getByRole('button', { name: 'GO' }).click()
    await expect(directRoute.getByLabel('NIGHTSHIFT HUD')).toContainText('SPEED')
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await mobile.close()
  })
})
