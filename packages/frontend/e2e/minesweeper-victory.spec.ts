import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/', reducedEffects = false) {
  await page.addInitScript((shouldReduce) => {
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
    if (shouldReduce) window.localStorage.setItem('2000sme:effects', 'reduced')
  }, reducedEffects)
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function openMinesweeper(page: Page) {
  await page.getByRole('button', { name: 'Open MINESWEEPER.EXE' }).dblclick()
  return page.getByRole('dialog', { name: 'MINESWEEPER.EXE window' })
}

async function safeCellIndexes(page: Page) {
  return page.evaluate(async () => {
    const { createGameState, revealCell } = await import('/src/games/minesweeper/index.ts')
    return revealCell(createGameState(), 0, 0).cells.filter((cell) => !cell.isMine).map((cell) => cell.index)
  })
}

async function winCurrentBoard(page: Page, directRoute = false) {
  const gameWindow = directRoute
    ? page.getByRole('main', { name: 'MINESWEEPER.EXE direct route' })
    : await openMinesweeper(page)
  for (const index of await safeCellIndexes(page)) {
    const cell = gameWindow.locator(`[data-minesweeper-cell-index="${index}"]`)
    if (await cell.getAttribute('data-cell-state') === 'hidden') await cell.click()
  }
  await expect(gameWindow.getByRole('heading', { name: 'ALL CLEAR' })).toBeVisible()
  return gameWindow
}

test.describe('TEST-16 GAME-13 Minesweeper browser and accessibility gate', () => {
  test('uses the approved static Minesweeper icon on desktop, Start menu, and mobile launcher surfaces', async ({ page, browser }) => {
    await visitPixelOs(page)
    const iconPath = '/pixelos/icons/pixelos-minesweeper-static-00.png'

    await expect(page.getByRole('button', { name: 'Open MINESWEEPER.EXE' }).locator('img')).toHaveAttribute('src', iconPath)
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Open MINESWEEPER.EXE' }).last().locator('img')).toHaveAttribute('src', iconPath)

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile)
    await expect(mobile.getByRole('link', { name: 'Minesweeper' }).locator('img')).toHaveAttribute('src', iconPath)
    await mobile.close()
  })

  test('shows one focused victory action on a real engine-derived win and resets through that action', async ({ page }) => {
    await visitPixelOs(page)
    const gameWindow = await winCurrentBoard(page)

    const newGame = gameWindow.getByRole('button', { name: 'NEW GAME' })
    await expect(gameWindow.getByText('BOARD SECURED')).toBeVisible()
    await expect(gameWindow.getByRole('status')).toHaveText('CLEARED: EVERY SAFE CELL IS REVEALED.')
    await expect(newGame).toBeFocused()
    await newGame.press('Enter')

    await expect(gameWindow.getByRole('heading', { name: 'ALL CLEAR' })).toHaveCount(0)
    await expect(gameWindow.getByRole('status')).toHaveText('READY: REVEAL A CELL TO START.')
  })

  test('keeps the static reduced-effects victory panel legible at compact viewport width', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(page, '/#/apps/minesweeper', true)
    const gameWindow = await winCurrentBoard(page, true)

    const overlay = gameWindow.getByLabel('ALL CLEAR')
    await expect(overlay).toBeVisible()
    await expect(overlay.locator('[aria-hidden="true"] [class*="victorySpark"]').first()).toHaveCSS('animation-name', 'none')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.close()
  })
})
