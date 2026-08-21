import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/') {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function openMinesweeper(page: Page) {
  await page.getByRole('button', { name: 'Open MINESWEEPER.EXE' }).dblclick()
  return page.getByRole('dialog', { name: 'MINESWEEPER.EXE window' })
}

test.describe('GAME-3 PixelOS Minesweeper', () => {
  test('launches through the desktop and renders the trusted engine controls', async ({ page }) => {
    await visitPixelOs(page)
    const gameWindow = await openMinesweeper(page)

    await expect(gameWindow.getByLabel('PixelOS Minesweeper')).toBeVisible()
    await expect(gameWindow.getByLabel('10 mines remaining')).toHaveText('MINES010')
    await expect(gameWindow.getByLabel('0 seconds elapsed')).toHaveText('TIME000')
    await expect(gameWindow.getByRole('button', { name: 'Start a new Minesweeper game' })).toBeVisible()
    await expect(gameWindow.getByRole('status')).toHaveText('READY: REVEAL A CELL TO START.')
  })

  test('supports reveal, scoped right-click flags, reset, Help, and roving keyboard play', async ({ page }) => {
    await visitPixelOs(page)
    const gameWindow = await openMinesweeper(page)
    const firstCell = gameWindow.getByRole('button', { name: 'Row 1, column 1, covered cell' })
    const flagCell = gameWindow.getByRole('button', { name: 'Row 1, column 3, covered cell' })

    await flagCell.click({ button: 'right' })
    await expect(gameWindow.getByRole('button', { name: 'Row 1, column 3, flagged cell' })).toBeFocused()

    await firstCell.click()
    await expect(gameWindow.getByRole('status')).toContainText('IN PROGRESS')

    await gameWindow.getByRole('button', { name: 'Start a new Minesweeper game' }).click()
    await expect(gameWindow.getByRole('status')).toHaveText('READY: REVEAL A CELL TO START.')

    await firstCell.focus()
    await page.keyboard.press('ArrowRight')
    const secondCell = gameWindow.getByRole('button', { name: 'Row 1, column 2, covered cell' })
    await expect(secondCell).toBeFocused()
    await page.keyboard.press('f')
    await expect(gameWindow.getByRole('button', { name: 'Row 1, column 2, flagged cell' })).toBeFocused()

    await gameWindow.getByRole('button', { name: 'Help' }).click()
    await expect(gameWindow.getByLabel('Minesweeper controls')).toContainText('ARROWS MOVE')
  })

  test('resolves directly and keeps the board within a narrow viewport without horizontal page scrolling', async ({ browser }) => {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await visitPixelOs(mobile, '/#/apps/minesweeper')

    const directRoute = mobile.getByRole('main', { name: 'MINESWEEPER.EXE direct route' })
    const board = mobile.getByRole('group', { name: /Minesweeper board/ })
    await expect(directRoute).toBeVisible()
    await expect(board).toBeVisible()
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await mobile.close()
  })
})
