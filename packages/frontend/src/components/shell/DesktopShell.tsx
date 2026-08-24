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

function shouldUseStaticNap() {
  if (typeof window === 'undefined') return true
  return document.documentElement.dataset.themeEffects === 'reduced'
    || (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
}

function DesktopNapDetail() {
  const [useStaticNap, setUseStaticNap] = useState(shouldUseStaticNap)
  const [gifFailed, setGifFailed] = useState(false)

  useEffect(() => {
    const syncNapSource = () => setUseStaticNap(shouldUseStaticNap())
    const rootObserver = new MutationObserver(syncNapSource)
    const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-effects'],
    })
    reducedMotionQuery?.addEventListener('change', syncNapSource)
    syncNapSource()

    return () => {
      rootObserver.disconnect()
      reducedMotionQuery?.removeEventListener('change', syncNapSource)
    }
  }, [])

  const source = useStaticNap || gifFailed
    ? PIXEL_OS_ASSETS.desktopNapStatic
    : PIXEL_OS_ASSETS.desktopNapGif

  return (
    <img
      className="pixelos-desktop-nap"
      src={source}
      alt=""
      aria-hidden="true"
      draggable={false}
      onError={() => setGifFailed(true)}
    />
  )
}

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
      <DesktopNapDetail />
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
