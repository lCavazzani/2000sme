import { expect, test, type Page } from '@playwright/test'

async function visitPixelOs(page: Page, path = '/') {
  await page.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-os-theme', 'pixelos')
  await expect(page.locator('html')).toHaveAttribute('data-theme-effects', 'full')
}

async function openDesktopPet(page: Page) {
  await visitPixelOs(page)
  await page.getByRole('button', { name: 'Open DESKTOP PET' }).dblclick()
  return page.getByRole('dialog', { name: 'DESKTOP PET window' })
}

async function advanceClockAndPause(page: Page, milliseconds: number) {
  const targetTime = await page.evaluate((advanceBy) => Date.now() + advanceBy, milliseconds)
  await page.clock.pauseAt(new Date(targetTime))
}

async function expectAcknowledgementFrame(pet: ReturnType<Page['getByRole']>, frame: '0' | '1' | '2') {
  await expect(pet.locator(`[data-acknowledgement-frame="${frame}"]`)).toBeVisible()
}

test.describe('TEST-19 grey-tabby Desktop Pet coverage', () => {
  test('preserves keyboard Pet, Treat, Pick, Reset, and explicit canonical opening with concise local semantics', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-08-25T00:00:00.000Z') })
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    const pet = await openDesktopPet(page)
    await advanceClockAndPause(page, 1)
    const cat = pet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })

    await expect(cat).toHaveAttribute('src', '/pixelos/pets/grey-tabby/grey-tabby-idle-128.gif')
    expect(await cat.evaluate((image) => {
      const rect = image.getBoundingClientRect()
      return [rect.width, rect.height, getComputedStyle(image).imageRendering]
    })).toEqual([128, 128, 'pixelated'])
    await expect(pet.locator('[role="status"]')).toHaveCount(1)
    await expect(pet.getByText('♥')).toHaveCount(0)
    await expect(pet.locator('img[src*="7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg"]')).toHaveCount(0)

    const petButton = pet.getByRole('button', { name: 'PET MITTENS' })
    await petButton.focus()
    await page.keyboard.press('Enter')
    const petAcknowledgement = pet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local pet" })
    await expect(petAcknowledgement).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-pet-readable-00.png',
    )
    await expect(pet.locator('[role="status"]')).toHaveText('Mittens leans into a local pet.')
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '1')
    await expect(petAcknowledgement).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-pet-readable-01.png',
    )
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '2')
    await expect(petAcknowledgement).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-pet-readable-02.png',
    )

    const treat = pet.getByRole('button', { name: 'TREAT MITTENS' })
    await treat.focus()
    await page.keyboard.press('Enter')
    const treatAcknowledgement = pet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local treat" })
    await expect(treatAcknowledgement).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-treat-reach-00.png',
    )
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '1')
    await expect(treatAcknowledgement).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-treat-reach-01.png',
    )
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '2')
    await expect(treatAcknowledgement).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-treat-reach-02.png',
    )
    const pick = pet.getByRole('region', { name: 'Local Pick' })
    await expect(pick).toContainText('LOCAL PICK · MY MACHINE')
    await expect(pet.getByRole('dialog', { name: 'MY MACHINE window' })).toHaveCount(0)

    const paw = pick.locator('img[src$="pixelos-grey-tabby-paw-00.png"]')
    await expect(paw).toHaveAttribute('alt', '')
    await expect(paw).toHaveAttribute('aria-hidden', 'true')
    expect(await paw.evaluate((image) => {
      const rect = image.getBoundingClientRect()
      return [rect.width, rect.height, getComputedStyle(image).imageRendering]
    })).toEqual([16, 16, 'pixelated'])
    expect(await paw.evaluate((image) => getComputedStyle(image.parentElement!).pointerEvents)).toBe('none')

    const openMachine = pick.getByRole('button', { name: 'OPEN MY MACHINE' })
    await openMachine.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'MY MACHINE window' })).toBeVisible()

    const reset = pet.getByRole('button', { name: 'RESET' })
    await reset.click()
    await expect(pet.getByRole('region', { name: 'Local Pick' })).toHaveCount(0)
    await expect(pet.locator('[role="status"]')).toHaveText('Mittens is resting beside this local PixelOS desk.')
    expect(requests.filter((url) => !url.startsWith('http://localhost:') && !url.startsWith('http://127.0.0.1:'))).toEqual([])
  })

  test('captures each deterministic full-effects acknowledgement frame and the original Treat static fallback', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-08-25T00:00:00.000Z') })
    await visitPixelOs(page, '/#/apps/pet')
    await advanceClockAndPause(page, 1)
    const pet = page.getByRole('main', { name: 'DESKTOP PET direct route' })

    await pet.getByRole('button', { name: 'PET MITTENS' }).click()
    await expectAcknowledgementFrame(pet, '0')
    await expect(pet).toHaveScreenshot('desktop-pet-readable-pet-frame-00.png', { animations: 'disabled' })
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '1')
    await expect(pet).toHaveScreenshot('desktop-pet-readable-pet-frame-01.png', { animations: 'disabled' })
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '2')
    await expect(pet).toHaveScreenshot('desktop-pet-readable-pet-frame-02.png', { animations: 'disabled' })

    await pet.getByRole('button', { name: 'TREAT MITTENS' }).click()
    await expectAcknowledgementFrame(pet, '0')
    await expect(pet).toHaveScreenshot('desktop-pet-treat-reach-frame-00.png', { animations: 'disabled' })
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '1')
    await expect(pet).toHaveScreenshot('desktop-pet-treat-reach-frame-01.png', { animations: 'disabled' })
    await advanceClockAndPause(page, 180)
    await expectAcknowledgementFrame(pet, '2')
    await expect(pet).toHaveScreenshot('desktop-pet-treat-reach-frame-02.png', { animations: 'disabled' })
  })

  test('uses static acknowledgement sources for reduced motion, effects reduction, and acknowledgement asset errors while preserving local controls', async ({ browser }) => {
    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await reduced.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await reduced.goto('/#/apps/pet')
    const reducedPet = reduced.getByRole('main', { name: 'DESKTOP PET direct route' })
    const reducedCat = reducedPet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })
    await expect(reducedCat).toHaveAttribute('src', '/pixelos/pets/grey-tabby/grey-tabby-idle-00.png')
    await expect(reducedPet.getByRole('button', { name: 'PET MITTENS' })).toHaveCSS('min-height', '44px')
    await reducedPet.getByRole('button', { name: 'PET MITTENS' }).click()
    await expect(reducedPet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local pet" })).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-pet-readable-00.png',
    )
    await reducedPet.getByRole('button', { name: 'TREAT MITTENS' }).click()
    await expect(reducedPet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local treat" })).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-treat-00.png',
    )
    await expect(reducedPet.getByRole('button', { name: 'OPEN MY MACHINE' })).toBeVisible()
    expect(await reduced.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(reducedPet).toHaveScreenshot('desktop-pet-grey-tabby-reduced-narrow.png', { animations: 'disabled' })
    await reduced.close()

    const assetFailure = await browser.newPage()
    await assetFailure.addInitScript(() => window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true'))
    await assetFailure.route('**/pixelos/pets/grey-tabby/pixelos-grey-tabby-treat-reach-00.png', (route) => route.abort())
    await assetFailure.goto('/#/apps/pet')
    const failurePet = assetFailure.getByRole('main', { name: 'DESKTOP PET direct route' })
    await failurePet.getByRole('button', { name: 'TREAT MITTENS' }).click()
    await expect(failurePet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local treat" })).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-treat-00.png',
    )
    await assetFailure.close()

    const storageFailure = await browser.newPage()
    await storageFailure.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      Object.defineProperty(Storage.prototype, 'getItem', { value: () => { throw new Error('storage unavailable') } })
      Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw new Error('storage unavailable') } })
    })
    await storageFailure.goto('/#/apps/pet')
    const storagePet = storageFailure.getByRole('main', { name: 'DESKTOP PET direct route' })
    await expect(storagePet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })).toBeVisible()
    await expect(storagePet.getByRole('button', { name: 'TREAT MITTENS' })).toBeEnabled()
    await storageFailure.close()
  })

  test('records a deterministic static Treat fallback route without legacy imagery or interactive decorative details', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
      window.localStorage.setItem('2000sme:effects', 'reduced')
    })
    await page.goto('/#/apps/pet')
    const pet = page.getByRole('main', { name: 'DESKTOP PET direct route' })
    await pet.getByRole('button', { name: 'TREAT MITTENS' }).click()

    await expect(pet.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local treat" })).toHaveAttribute(
      'src',
      '/pixelos/pets/grey-tabby/pixelos-grey-tabby-treat-00.png',
    )
    await expect(pet.locator('img[aria-hidden="true"]')).toHaveCount(2)
    await expect(pet.getByText(/orange cat|moon|heart/i)).toHaveCount(0)
    await expect(pet).toHaveScreenshot('desktop-pet-grey-tabby-static-treat-fallback.png', { animations: 'disabled' })
  })
})
