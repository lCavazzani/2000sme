import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
import { PixelPet } from './PixelPet'

const { openWindowById } = vi.hoisted(() => ({
  openWindowById: vi.fn(),
}))

vi.mock('../../store/windows', () => ({
  useWindows: () => ({ openWindowById }),
}))

describe('PixelPet', () => {
  beforeEach(() => {
    document.documentElement.dataset.themeEffects = 'full'
    openWindowById.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
    delete document.documentElement.dataset.themeEffects
  })

  it('plays the readable Pet and original-pose Treat confirmations exactly once before holding their final frames', () => {
    vi.useFakeTimers()
    render(<PixelPet />)

    fireEvent.click(screen.getByRole('button', { name: 'PET MITTENS' }))
    const cat = screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local pet" })
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyPetReadableStatic)
    expect(screen.getByRole('status')).toHaveTextContent('Mittens leans into a local pet.')

    act(() => vi.advanceTimersByTime(180))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyPetReadableFrameOne)
    act(() => vi.advanceTimersByTime(180))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyPetReadableFrameTwo)
    act(() => vi.advanceTimersByTime(900))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyPetReadableFrameTwo)

    fireEvent.click(screen.getByRole('button', { name: 'TREAT MITTENS' }))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyTreatReachFrameZero)
    expect(screen.getByRole('status')).toHaveTextContent('Pick ready: MY MACHINE.')
    act(() => vi.advanceTimersByTime(180))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyTreatReachFrameOne)
    act(() => vi.advanceTimersByTime(180))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyTreatReachFrameTwo)
  })

  it('uses the approved static acknowledgement fallbacks for reduced effects and asset errors', () => {
    document.documentElement.dataset.themeEffects = 'reduced'
    const view = render(<PixelPet />)
    const cat = screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyIdleStatic)

    fireEvent.click(screen.getByRole('button', { name: 'PET MITTENS' }))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyPetReadableStatic)
    fireEvent.click(screen.getByRole('button', { name: 'TREAT MITTENS' }))
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyTreatStatic)

    view.unmount()
    document.documentElement.dataset.themeEffects = 'full'
    render(<PixelPet />)
    const fullEffectsCat = screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })
    fireEvent.click(screen.getByRole('button', { name: 'PET MITTENS' }))
    fireEvent.error(fullEffectsCat)
    expect(fullEffectsCat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyPetReadableStatic)

    fireEvent.click(screen.getByRole('button', { name: 'TREAT MITTENS' }))
    fireEvent.error(fullEffectsCat)
    expect(fullEffectsCat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyTreatStatic)
  })

  it('uses a stable local Pick order and opens only after the explicit visitor action', () => {
    render(<PixelPet />)

    fireEvent.click(screen.getByRole('button', { name: 'TREAT MITTENS' }))
    expect(screen.getByRole('button', { name: 'OPEN MY MACHINE' })).toBeInTheDocument()
    expect(openWindowById).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'OPEN MY MACHINE' }))
    expect(openWindowById).toHaveBeenCalledWith('my-computer')

    fireEvent.click(screen.getByRole('button', { name: 'TREAT MITTENS' }))
    expect(screen.getByRole('button', { name: 'OPEN PIXEL GALLERY' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'RESET' }))
    expect(screen.queryByRole('region', { name: 'Local Pick' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Mittens is resting beside this local PixelOS desk.')
    expect(screen.getByLabelText('Desktop Pet status')).toHaveTextContent('LOCAL COMPANIONSESSION ONLYNO NETWORK')
  })
})
