import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeAssetIcon } from './ThemeSystemIcon'

describe('ThemeAssetIcon', () => {
  it('renders the supplied About PixelOS and Resume source frames as labelled raster icons', () => {
    render(
      <>
        <ThemeAssetIcon name="about" alt="About PixelOS" width={32} height={32} />
        <ThemeAssetIcon name="resume" alt="Resume" width={32} height={32} />
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
  })
})
