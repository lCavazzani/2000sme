import { type KeyboardEvent } from 'react'
import type { ApplicationId } from '../config/applicationRegistry'
import { useWindows } from '../store/windows'
import { ThemeAssetIcon } from './ThemeSystemIcon'
import styles from './DesktopIcon.module.css'

type DesktopIconProps = {
  label: string
  icon: string
  applicationId?: ApplicationId
  windowId: string
  isSelected: boolean
  onSelect: (windowId: string) => void
}

export function DesktopIcon({
  label,
  icon,
  applicationId,
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
      data-window-launcher={windowId}
    >
      {applicationId ? (
        <ThemeAssetIcon name={applicationId} width={64} height={64} />
      ) : (
        <img src={icon} alt="" width={64} height={64} draggable={false} />
      )}
      <span>{label}</span>
    </button>
  )
}
