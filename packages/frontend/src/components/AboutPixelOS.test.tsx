import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AboutPixelOS } from './AboutPixelOS'

describe('AboutPixelOS', () => {
  it('shows the approved local PixelOS information without update or download affordances', () => {
    render(<AboutPixelOS />)

    expect(screen.getByRole('img', { name: 'PixelOS mascot in a small pixel-art scene' })).toBeInTheDocument()
    expect(screen.getByText('Pixel OS v2.0')).toBeInTheDocument()
    expect(screen.getByText('Your nostalgic desktop in the web.')).toBeInTheDocument()
    expect(screen.getByText('A tiny portfolio by Leonardo Cavazzani.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText(/update|download/i)).not.toBeInTheDocument()
  })
})
