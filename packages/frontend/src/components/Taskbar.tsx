import { useEffect, useState } from 'react'
import { applicationsForSurface, type ApplicationId } from '../config/applicationRegistry'
import { useWindows } from '../store/windows'
import type { WindowState } from '../types/window'
import styles from './Taskbar.module.css'

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function WindowsLogo() {
  return (
    <span className={styles.windowsLogo} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  )
}

export function Taskbar() {
  const { windows, focusWindow, minimizeWindow, restoreWindow, openWindowById } = useWindows()
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const openWindows = windows.filter((windowState) => windowState.isOpen)
  const activeWindowId = openWindows
    .filter((windowState) => !windowState.isMinimized)
    .reduce<WindowState | null>(
      (activeWindow, windowState) =>
        !activeWindow || windowState.zIndex > activeWindow.zIndex
          ? windowState
          : activeWindow,
      null,
    )?.id

  function toggleWindow(windowState: WindowState) {
    if (windowState.isMinimized) {
      restoreWindow(windowState.id)
      return
    }

    if (windowState.id === activeWindowId) {
      minimizeWindow(windowState.id)
      return
    }

    focusWindow(windowState.id)
  }

  function launchApplication(id: ApplicationId) {
    openWindowById(id)
    setIsStartMenuOpen(false)
  }

  return (
    <>
      {isStartMenuOpen && (
        <div id="start-menu" className={styles.startMenu} role="menu" aria-label="Start menu">
          <div className={styles.startMenuBanner}>2000sme</div>
          {applicationsForSurface('start-menu').map((application) => (
            <button
              className={styles.startMenuItem}
              role="menuitem"
              key={application.id}
              data-window-launcher={application.id}
              onClick={() => launchApplication(application.id)}
            >
              <img src={application.icon} alt="" width={20} height={20} />
              {application.label}
            </button>
          ))}
        </div>
      )}
      <footer className={styles.taskbar} aria-label="Windows taskbar">
        <button
          className={styles.startButton}
          aria-expanded={isStartMenuOpen}
          aria-controls="start-menu"
          onClick={() => setIsStartMenuOpen((isOpen) => !isOpen)}
        >
          <WindowsLogo />
          <span>Start</span>
        </button>
        <div className={styles.windowList} aria-label="Open windows">
          {openWindows.map((windowState) => {
            const isActive = windowState.id === activeWindowId
            return (
              <button
                className={`${styles.windowButton} ${isActive ? styles.activeWindowButton : ''}`}
                key={windowState.id}
                aria-pressed={isActive}
                data-window-taskbar={windowState.id}
                onClick={() => toggleWindow(windowState)}
              >
                {windowState.icon && <img src={windowState.icon} alt="" width={16} height={16} />}
                <span>{windowState.title}</span>
              </button>
            )
          })}
        </div>
        <div className={styles.systemTray} aria-label="System tray">
          <time dateTime={now.toISOString()}>{formatTime(now)}</time>
        </div>
      </footer>
    </>
  )
}
