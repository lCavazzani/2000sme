import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { applicationsForSurface, findApplication, type ApplicationId } from '../config/applicationRegistry'
import { useWindows } from '../store/windows'
import type { WindowState } from '../types/window'
import { ThemeAssetIcon } from './ThemeSystemIcon'
import styles from './Taskbar.module.css'

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function Taskbar() {
  const { windows, focusWindow, minimizeWindow, restoreWindow, openWindowById } = useWindows()
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const startMenuRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!isStartMenuOpen) return

    window.requestAnimationFrame(() => {
      startMenuRef.current?.querySelector<HTMLButtonElement>('[data-window-launcher]')?.focus()
    })
  }, [isStartMenuOpen])

  const startMenuApplications = applicationsForSurface('start-menu')
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

  function closeStartMenu() {
    setIsStartMenuOpen(false)
    window.requestAnimationFrame(() => startButtonRef.current?.focus())
  }

  function handleStartMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    closeStartMenu()
  }

  return (
    <>
      {isStartMenuOpen && (
        <nav
          ref={startMenuRef}
          id="start-menu"
          className={styles.startMenu}
          aria-label="Start menu"
          onKeyDown={handleStartMenuKeyDown}
        >
          <div className={styles.startMenuBanner} aria-hidden="true">PIXELOS 2.0</div>
          <section className={styles.startMenuGroup} role="group" aria-labelledby="start-menu-applications">
            <h2 id="start-menu-applications" className={styles.startMenuGroupHeading}>Applications</h2>
            {startMenuApplications.map((application) => (
              <button
                className={styles.startMenuItem}
                key={application.id}
                data-window-launcher={application.id}
                onClick={() => launchApplication(application.id)}
              >
                <ThemeAssetIcon name={application.id} width={20} height={20} />
                {application.label}
              </button>
            ))}
          </section>
        </nav>
      )}
      <footer className={styles.taskbar} aria-label="PixelOS taskbar">
        <button
          ref={startButtonRef}
          className={styles.startButton}
          aria-expanded={isStartMenuOpen}
          aria-controls="start-menu"
          onClick={() => setIsStartMenuOpen((isOpen) => !isOpen)}
        >
          <ThemeAssetIcon name="start" width={18} height={18} />
          <span>Start</span>
        </button>
        <div className={styles.windowList} role="group" aria-label="Open windows">
          {openWindows.map((windowState) => {
            const isActive = windowState.id === activeWindowId
            const application = findApplication(windowState.id)
            return (
              <button
                className={`${styles.windowButton} ${isActive ? styles.activeWindowButton : ''}`}
                key={windowState.id}
                aria-pressed={isActive}
                data-window-taskbar={windowState.id}
                onClick={() => toggleWindow(windowState)}
              >
                {application ? (
                  <ThemeAssetIcon name={application.id} width={16} height={16} />
                ) : (
                  windowState.icon && <img src={windowState.icon} alt="" width={16} height={16} />
                )}
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
