import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { FileExplorer } from './FileExplorer'

it('renders the PixelOS My Machine path and portfolio-safe object grid', async () => {
  const user = userEvent.setup()
  render(<FileExplorer />)

  expect(screen.getByLabelText('Current path')).toHaveTextContent('C:\\PORTFOLIO\\')
  expect(screen.getByRole('button', { name: 'PORTFOLIO (C:)' })).toBeVisible()
  expect(screen.getByText(/object\(s\)$/)).toBeVisible()

  const sportifolio = screen.getByRole('button', { name: '00SPORTIFOLIO' })
  await user.click(sportifolio)

  expect(sportifolio).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText(/2026 · React, TypeScript/)).toBeVisible()
})
