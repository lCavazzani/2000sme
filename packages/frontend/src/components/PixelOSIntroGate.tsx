import { useEffect, useRef, useState } from 'react'
import { PIXEL_OS_ASSETS } from '../config/pixelosAssets'
import { DesktopShell } from './shell/DesktopShell'
import { hasSeenPixelOsIntro, markPixelOsIntroSeen } from '../utils/pixelosIntroSession'
import styles from './PixelOSIntroGate.module.css'

type IntroStage = 'boot' | 'enter' | 'desktop'

const BOOT_TO_ENTER_DELAY_MS = 1_600

function isDirectApplicationRoute() {
  return window.location.hash.startsWith('#/apps/')
}

function reducedEffectsRequested() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem('2000sme:effects') === 'reduced'
      || (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  } catch {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  }
}

function initialStage(): IntroStage {
  if (isDirectApplicationRoute() || hasSeenPixelOsIntro()) return 'desktop'
  return reducedEffectsRequested() ? 'enter' : 'boot'
}

function PixelWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? styles.wordmarkCompact : styles.wordmark} aria-label="Pixel OS">
      <span>PIXEL</span>
      <span>OS</span>
    </span>
  )
}

export function PixelOSIntroGate() {
  const [stage, setStage] = useState<IntroStage>(initialStage)
  const skipButtonRef = useRef<HTMLButtonElement>(null)
  const enterButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (stage !== 'boot') return
    if (reducedEffectsRequested()) {
      setStage('enter')
      return
    }

    const transitionTimer = window.setTimeout(() => setStage('enter'), BOOT_TO_ENTER_DELAY_MS)
    return () => window.clearTimeout(transitionTimer)
  }, [stage])

  useEffect(() => {
    if (stage === 'boot') skipButtonRef.current?.focus()
    if (stage === 'enter') enterButtonRef.current?.focus()
  }, [stage])

  function enterDesktop() {
    markPixelOsIntroSeen()
    setStage('desktop')
  }

  function handleEscape(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      enterDesktop()
    }
  }

  if (stage === 'desktop') return <DesktopShell />

  if (stage === 'boot') {
    return (
      <main className={styles.root} data-intro-stage="boot" onKeyDown={handleEscape}>
        <span className={styles.stageAnnouncement} role="status">PixelOS introduction. Skip intro is available.</span>
        <section className={styles.bootCard} aria-labelledby="pixelos-boot-title">
          <h1 id="pixelos-boot-title" className={styles.bootTitle}><PixelWordmark /></h1>
          <p className={styles.bootStatus}>PREPARING DESKTOP</p>
          <div className={styles.bootCells} aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span key={index} className={styles.bootCellActive} />
            ))}
          </div>
        </section>
        <button ref={skipButtonRef} type="button" className={styles.skipButton} onClick={enterDesktop}>Skip intro</button>
        <img
          className={styles.bootBeacon}
          src={PIXEL_OS_ASSETS.bootBeacon}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </main>
    )
  }

  return (
    <main className={styles.root} data-intro-stage="enter" onKeyDown={handleEscape}>
      <span className={styles.stageAnnouncement} role="status">PixelOS introduction. Enter Desktop or Skip to Desktop.</span>
      <section className={styles.enterPanel} aria-labelledby="pixelos-enter-title">
        <h1 id="pixelos-enter-title" className={styles.enterTitle}><PixelWordmark compact /></h1>
        <img
          className={styles.ownerPortrait}
          src={PIXEL_OS_ASSETS.leonardoEntryHero}
          width={128}
          height={128}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <p className={styles.ownerName}>LEONARDO CAVAZZANI</p>
        <p className={styles.ownerRole}>Senior Software Engineer</p>
        <button ref={enterButtonRef} type="button" className={styles.enterButton} onClick={enterDesktop}>Enter Desktop</button>
        <p className={styles.invitation}>A pixel desktop portfolio. Explore the machine.</p>
      </section>
      <button type="button" className={styles.skipButton} onClick={enterDesktop}>Skip to Desktop</button>
    </main>
  )
}
