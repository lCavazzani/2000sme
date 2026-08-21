import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applicationIdFromHash,
  applicationsForSurface,
} from '../../config/applicationRegistry'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
import { useWindows } from '../../store/windows'
import { DesktopIcon } from './DesktopIcon'
import { DirectApplicationRoute } from './DirectApplicationRoute'
import { MobileLauncher } from './MobileLauncher'
import { Taskbar } from './Taskbar'
import { Window } from './Window'
import { ApplicationContent } from './ApplicationContent'

/**
 * Owns desktop orchestration only. Application content and direct-route
 * presentation are intentionally delegated to focused components.
 */
export function DesktopShell() {
  const { windows, openWindowById } = useWindows()
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null)
  const [hash, setHash] = useState(() => window.location.hash)
  const [shouldRestoreDesktopFocus, setShouldRestoreDesktopFocus] = useState(false)
  const desktopRef = useRef<HTMLElement>(null)
  const directApplicationId = applicationIdFromHash(hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || !/^Digit[1-6]$/.test(event.code)) return
      const application = applicationsForSurface('desktop').find(
        (candidate) => candidate.shortcut === `Alt+${event.key}`,
      )
      if (!application) return
      event.preventDefault()
      openWindowById(application.id)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openWindowById])

  useEffect(() => {
    if (directApplicationId || !shouldRestoreDesktopFocus) return

    const frame = window.requestAnimationFrame(() => {
      desktopRef.current?.focus()
      setShouldRestoreDesktopFocus(false)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [directApplicationId, shouldRestoreDesktopFocus])

  const openDesktop = useCallback(() => {
    setShouldRestoreDesktopFocus(true)
    if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
    setHash('')
  }, [])

  if (directApplicationId) {
    return <DirectApplicationRoute applicationId={directApplicationId} onOpenDesktop={openDesktop} />
  }

  return (
    <main
      ref={desktopRef}
      className="desktop"
      aria-label="Desktop"
      data-desktop-root
      tabIndex={-1}
    >
      <img
        className="pixelos-desktop-sprite pixelos-sprite-bob"
        src={PIXEL_OS_ASSETS.mittens}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <MobileLauncher />
      <section className="desktopIcons" aria-label="Desktop applications">
        {applicationsForSurface('desktop').map((application) => (
          <DesktopIcon
            key={application.id}
            label={application.label}
            icon={application.icon}
            applicationId={application.id}
            windowId={application.id}
            isSelected={selectedWindowId === application.id}
            onSelect={setSelectedWindowId}
          />
        ))}
      </section>
      {windows.map((windowState) => (
        <Window key={windowState.id} id={windowState.id}>
          <ApplicationContent windowId={windowState.id} title={windowState.title} />
        </Window>
      ))}
      <Taskbar />
    </main>
  )
}
