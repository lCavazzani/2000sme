import { expect, test, type Page } from '@playwright/test'

type AnimationProbe = {
  requested: number
  cancelled: number
}

declare global {
  interface Window {
    __nightshiftAnimationProbe?: AnimationProbe
  }
}

async function visitPixelOs(page: Page, path = '/') {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
    const originalRequest = window.requestAnimationFrame.bind(window)
    const originalCancel = window.cancelAnimationFrame.bind(window)
    window.__nightshiftAnimationProbe = { requested: 0, cancelled: 0 }
    window.requestAnimationFrame = (callback) => {
      window.__nightshiftAnimationProbe!.requested += 1
      return originalRequest(callback)
    }
    window.cancelAnimationFrame = (id) => {
      window.__nightshiftAnimationProbe!.cancelled += 1
      originalCancel(id)
    }
  })
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
}

async function openNightshift(page: Page) {
  await page.getByRole('button', { name: 'Open NIGHTSHIFT.EXE' }).dblclick()
  return page.getByRole('dialog', { name: 'NIGHTSHIFT.EXE window' })
}

test.describe('TEST-15 NIGHTSHIFT quality gate', () => {
  test('cancels the active simulation loop on minimize and route teardown, and resumes only by explicit intent', async ({ page }) => {
    await visitPixelOs(page)
    const gameWindow = await openNightshift(page)
    await gameWindow.getByRole('button', { name: 'START SHIFT' }).click()
    await expect(gameWindow.getByText('RUNNING', { exact: true })).toBeVisible()

    const beforeMinimize = await page.evaluate(() => ({ ...window.__nightshiftAnimationProbe! }))
    await gameWindow.getByRole('button', { name: 'Minimize' }).click()
    await expect(page.getByRole('dialog', { name: 'NIGHTSHIFT.EXE window' })).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.__nightshiftAnimationProbe!.cancelled)).toBeGreaterThan(beforeMinimize.cancelled)

    await page.locator('[data-window-taskbar="nightshift"]').click()
    const restored = page.getByRole('dialog', { name: 'NIGHTSHIFT.EXE window' })
    await expect(restored.getByText('READY', { exact: true })).toBeVisible()
    await restored.getByRole('button', { name: 'START SHIFT' }).click()
    await expect(restored.getByText('RUNNING', { exact: true })).toBeVisible()

    const beforeRouteChange = await page.evaluate(() => ({ ...window.__nightshiftAnimationProbe! }))
    await page.evaluate(() => {
      window.location.hash = '#/apps/my-computer'
    })
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#/apps/my-computer')
    await expect.poll(() => page.evaluate(() => window.__nightshiftAnimationProbe!.cancelled)).toBeGreaterThan(beforeRouteChange.cancelled)
  })

  test('keeps a responsive animation-frame baseline and supports local controls without network activity', async ({ page }) => {
    await page.addInitScript(() => {
      let requests = 0
      const originalFetch = window.fetch.bind(window)
      window.fetch = (...args) => {
        requests += 1
        return originalFetch(...args)
      }
      ;(window as Window & { __nightshiftRequestCount?: () => number }).__nightshiftRequestCount = () => requests
    })
    await visitPixelOs(page, '/#/apps/nightshift')

    const route = page.getByRole('main', { name: 'NIGHTSHIFT.EXE direct route' })
    await route.getByRole('button', { name: 'START SHIFT' }).click()
    await expect(route.getByText('RUNNING', { exact: true })).toBeVisible()
    await route.getByRole('button', { name: 'GO' }).click()
    await route.getByRole('button', { name: 'LEFT' }).click()
    await route.getByRole('button', { name: 'PAUSE / RESUME' }).click()
    await expect(route.getByText('PAUSED', { exact: true })).toBeVisible()

    const frameStats = await page.evaluate(async () => {
      const frames: number[] = []
      let previous = performance.now()
      await new Promise<void>((resolve) => {
        const capture = (timestamp: number) => {
          frames.push(timestamp - previous)
          previous = timestamp
          if (frames.length === 12) resolve()
          else window.requestAnimationFrame(capture)
        }
        window.requestAnimationFrame(capture)
      })
      return frames.reduce((total, frame) => total + frame, 0) / frames.length
    })

    expect(frameStats).toBeLessThan(80)
    expect(await page.evaluate(() => (window as Window & { __nightshiftRequestCount?: () => number }).__nightshiftRequestCount?.() ?? 0)).toBe(0)
  })
})
