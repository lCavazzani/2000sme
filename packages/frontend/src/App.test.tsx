import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

describe('direct application routes', () => {
  afterEach(() => {
    window.location.hash = ''
    window.sessionStorage.clear()
  })

  it('renders the contact destination without requiring desktop window interactions', () => {
    window.location.hash = '#/apps/contact'

    render(<App />)

    expect(screen.getByRole('main', { name: 'Contact direct route' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'cavazzanileonardo@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:cavazzanileonardo@gmail.com',
    )
    expect(screen.getByRole('link', { name: 'Open desktop' })).toHaveAttribute('href', '#')
  })
})
