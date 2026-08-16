import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { WindowsProvider, useWindows } from '../store/windows'
import { DesktopIcon } from './DesktopIcon'

function OpenWindowCount() {
  const { windows } = useWindows()
  return <output>{windows.length}</output>
}

it('opens a desktop app through its launcher interaction contract', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()

  render(
    <WindowsProvider>
      <DesktopIcon
        label="Portfolio"
        icon="/icons.svg#portfolio"
        windowId="portfolio"
        isSelected={false}
        onSelect={onSelect}
      />
      <OpenWindowCount />
    </WindowsProvider>,
  )

  const launcher = screen.getByRole('button', { name: 'Open Portfolio' })
  await user.click(launcher)
  expect(onSelect).toHaveBeenCalledWith('portfolio')

  await user.dblClick(launcher)
  expect(screen.getByText('1')).toBeInTheDocument()
})
