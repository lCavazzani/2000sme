import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { applicationsForSurface } from '../config/applicationRegistry'
import { MobileLauncher } from './MobileLauncher'

describe('MobileLauncher', () => {
  it('exposes every mobile application as an accessible direct route', () => {
    render(<MobileLauncher />)

    expect(screen.getByRole('navigation', { name: 'Portfolio applications' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Explore the portfolio' })).toBeInTheDocument()

    for (const application of applicationsForSurface('mobile')) {
      expect(screen.getByRole('link', { name: application.mobileLabel })).toHaveAttribute('href', application.path)
    }
  })
})
