import { type KeyboardEvent } from 'react'
import { useWindows } from '../store/windows'
import styles from './DesktopIcon.module.css'

type DesktopIconProps = {
  label: string
  icon: string
  windowId: string
  isSelected: boolean
  onSelect: (windowId: string) => void
}

export function DesktopIcon({
  label,
  icon,
  windowId,
  isSelected,
  onSelect,
}: DesktopIconProps) {
  const { openWindowById } = useWindows()

  function open() {
    openWindowById(windowId)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open()
    }
  }

  return (
    <button
      type="button"
      className={`${styles.desktopIcon} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(windowId)}
      onDoubleClick={open}
      onFocus={() => onSelect(windowId)}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${label}`}
    >
      <img src={icon} alt="" width={32} height={32} draggable={false} />
      <span>{label}</span>
    </button>
  )
}
