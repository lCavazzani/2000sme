import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeAssetIcon } from './ThemeSystemIcon'

describe('ThemeAssetIcon', () => {
  it('renders supplied About PixelOS, Resume, and Minesweeper source frames as labelled raster icons', () => {
    render(
      <>
        <ThemeAssetIcon name="about" alt="About PixelOS" width={32} height={32} />
        <ThemeAssetIcon name="resume" alt="Resume" width={32} height={32} />
        <ThemeAssetIcon name="minesweeper" alt="Minesweeper" width={32} height={32} />
      </>,
    )

    expect(screen.getByRole('img', { name: 'About PixelOS' })).toHaveAttribute(
      'src',
      '/pixelos/icons/pixelos-about-me-static-00.png',
    )
    expect(screen.getByRole('img', { name: 'Resume' })).toHaveAttribute(
      'src',
      '/pixelos/icons/pixelos-resume-static-00.png',
    )
    expect(screen.getByRole('img', { name: 'Minesweeper' })).toHaveAttribute(
      'src',
      '/pixelos/icons/pixelos-minesweeper-static-00.png',
    )
  })
})
