import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

describe('direct application routes', () => {
  afterEach(() => {
    window.location.hash = ''
    window.sessionStorage.clear()
  })

  it('falls back to the desktop for the retired Contact route', () => {
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
    window.location.hash = '#/apps/contact'

    render(<App />)

    expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Contact' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'cavazzanileonardo@gmail.com' })).not.toBeInTheDocument()
  })
})
