import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PixelGallery } from './PixelGallery'

describe('PixelGallery', () => {
  it('selects every supplied gallery asset with an accessible active state and updated status', () => {
    render(<PixelGallery />)

    expect(screen.getByRole('img', { name: 'Pixel-art harbour at dusk beneath a violet sky' })).toBeInTheDocument()

    const cockpit = screen.getByRole('button', { name: 'Show COCKPIT.PNG' })
    fireEvent.click(cockpit)

    expect(cockpit).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('img', { name: 'Pixel-art spacecraft cockpit looking into a nebula' })).toBeInTheDocument()
    expect(screen.getByLabelText('Pixel Gallery status')).toHaveTextContent('COCKPIT.PNG')
    expect(screen.getByRole('button', { name: 'Show HARBOUR.PNG' })).toHaveAttribute('aria-pressed', 'false')
  })
})
