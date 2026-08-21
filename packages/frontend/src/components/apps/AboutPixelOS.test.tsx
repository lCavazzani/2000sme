import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WindowsProvider } from '../../store/windows'
import { AboutPixelOS } from './AboutPixelOS'

describe('AboutPixelOS', () => {
  it('shows approved PixelOS information, system metadata, and an OK close action without update or download affordances', () => {
    render(
      <WindowsProvider>
        <AboutPixelOS />
      </WindowsProvider>,
    )

    expect(screen.getByRole('img', { name: 'PixelOS mascot in a small pixel-art scene' })).toBeInTheDocument()
    expect(screen.getByText('Pixel OS v2.0')).toBeInTheDocument()
    expect(screen.getByText('Your nostalgic desktop in the web.')).toBeInTheDocument()
    expect(screen.getByText('A tiny portfolio by Leonardo Cavazzani.')).toBeInTheDocument()
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('2.0.0')).toBeInTheDocument()
    expect(screen.getByText('PixelOS web desktop')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled()
    expect(screen.queryByText(/update|download/i)).not.toBeInTheDocument()
  })
})
