import { fireEvent, render, screen } from '@testing-library/react'
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
    delete document.documentElement.dataset.themeEffects
  })

  it('uses approved grey-tabby acknowledgement frames with one concise local status message', () => {
    render(<PixelPet />)

    const cat = screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyIdleGif)
    expect(screen.getByText('MITTENS.EXE')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Mittens is resting beside this local PixelOS desk.')

    fireEvent.click(screen.getByRole('button', { name: 'PET MITTENS' }))
    expect(screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local pet" })).toHaveAttribute(
      'src',
      PIXEL_OS_ASSETS.greyTabbyPet,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Mittens leans into a local pet.')

    fireEvent.click(screen.getByRole('button', { name: 'TREAT MITTENS' }))
    expect(screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, acknowledging a local treat" })).toHaveAttribute(
      'src',
      PIXEL_OS_ASSETS.greyTabbyTreat,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Pick ready: MY MACHINE.')
    expect(screen.getByRole('region', { name: 'Local Pick' })).toHaveTextContent('Start with the project map and desktop folders.')
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

  it('uses the approved static idle fallback for reduced effects and GIF errors', () => {
    document.documentElement.dataset.themeEffects = 'reduced'
    const view = render(<PixelPet />)

    expect(screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })).toHaveAttribute(
      'src',
      PIXEL_OS_ASSETS.greyTabbyIdleStatic,
    )

    view.unmount()
    document.documentElement.dataset.themeEffects = 'full'
    render(<PixelPet />)
    const cat = screen.getByRole('img', { name: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk" })
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyIdleGif)
    fireEvent.error(cat)
    expect(cat).toHaveAttribute('src', PIXEL_OS_ASSETS.greyTabbyIdleStatic)
  })
})
