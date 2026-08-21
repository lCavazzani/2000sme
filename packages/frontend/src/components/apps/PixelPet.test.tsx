import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PixelPet } from './PixelPet'

describe('PixelPet', () => {
  it('provides local Pet and Feed feedback with meaningful cat artwork text', () => {
    render(<PixelPet />)

    expect(screen.getByRole('img', { name: 'Mittens, an orange cat resting on a windowsill' })).toBeInTheDocument()
    expect(screen.getByText('Mittens is watching the PixelOS skyline.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pet Mittens' }))
    expect(screen.getByText('Mittens purrs and leans into your hand.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Feed Mittens' }))
    expect(screen.getByText('Mittens accepts a pixel snack and flicks a happy tail.')).toBeInTheDocument()
    expect(screen.getByLabelText('Desktop Pet status')).toHaveTextContent('NO NETWORK')
  })
})
