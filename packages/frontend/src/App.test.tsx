import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

describe('direct application routes', () => {
  afterEach(() => {
    window.location.hash = ''
    window.sessionStorage.clear()
  })

  it('falls back to the desktop for the retired Contact route', async () => {
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
    window.location.hash = '#/apps/contact'

    render(<App />)

    expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'RESUME.PDF - WORDPAD window' })).toBeInTheDocument())
    expect(screen.queryByRole('heading', { name: 'Contact' })).not.toBeInTheDocument()
  })
})
