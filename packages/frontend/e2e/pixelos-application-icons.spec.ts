import { expect, test } from '@playwright/test'

const approvedIcons = {
  'my-computer': '/pixelos/icons/pixelos-my-machine-static-00.png',
  gallery: '/pixelos/icons/pixelos-gallery-static-00.png',
  pet: '/pixelos/icons/pixelos-desktop-pet-static-00.png',
  notepad: '/pixelos/icons/pixelos-readme-static-00.png',
} as const


test('PXOS-X uses the approved static icon family on desktop, Start menu, and mobile launchers', async ({ page }) => {
  await page.goto('/')

  for (const [applicationId, iconPath] of Object.entries(approvedIcons)) {
    const desktopIcon = page.locator(`[data-window-launcher="${applicationId}"]`).first().locator('img')
    await expect(desktopIcon).toHaveAttribute('src', new RegExp(`${iconPath}$`))
    await expect(desktopIcon).toHaveAttribute('alt', '')
  }

  await page.getByRole('button', { name: 'Start' }).click()
  for (const [applicationId, iconPath] of Object.entries(approvedIcons)) {
    const startMenuIcon = page
      .getByRole('navigation', { name: 'Start menu' })
      .locator(`[data-window-launcher="${applicationId}"] img`)
    await expect(startMenuIcon).toHaveAttribute('src', new RegExp(`${iconPath}$`))
    await expect(startMenuIcon).toHaveAttribute('alt', '')
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  for (const [applicationId, iconPath] of Object.entries(approvedIcons)) {
    const mobileIcon = page.locator(`a[href="#/apps/${applicationId}"] img`)
    await expect(mobileIcon).toHaveAttribute('src', new RegExp(`${iconPath}$`))
    await expect(mobileIcon).toHaveAttribute('alt', '')
  }
})
