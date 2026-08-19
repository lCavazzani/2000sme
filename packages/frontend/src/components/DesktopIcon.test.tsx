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
        label="MY MACHINE"
        icon="/desktop-icons/my-computer.svg"
        applicationId="my-computer"
        windowId="my-computer"
        isSelected={false}
        onSelect={onSelect}
      />
      <OpenWindowCount />
    </WindowsProvider>,
  )

  const launcher = screen.getByRole('button', { name: 'Open MY MACHINE' })
  await user.click(launcher)
  expect(onSelect).toHaveBeenCalledWith('my-computer')

  await user.dblClick(launcher)
  expect(screen.getByText('1')).toBeInTheDocument()
})
