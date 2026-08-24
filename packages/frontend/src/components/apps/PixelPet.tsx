import { useEffect, useState } from 'react'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
import type { ApplicationId } from '../../config/applicationRegistry'
import { useWindows } from '../../store/windows'
import styles from './PixelPet.module.css'

type PetAction = 'idle' | 'pet' | 'treat'

type PickDestination = {
  id: ApplicationId
  label: string
  reason: string
}

const PET_DISPLAY_NAME = 'MITTENS.EXE'

const PICK_DESTINATIONS: readonly PickDestination[] = [
  {
    id: 'my-computer',
    label: 'MY MACHINE',
    reason: 'Start with the project map and desktop folders.',
  },
  {
    id: 'gallery',
    label: 'PIXEL GALLERY',
    reason: 'See the visual world and project imagery.',
  },
  {
    id: 'about',
    label: 'ABOUT PIXELOS',
    reason: 'Read the design principles behind the desktop.',
  },
  {
    id: 'resume',
    label: 'RESUME.PDF',
    reason: 'Open Leonardo’s background and experience.',
  },
]

function shouldUseStaticIdle() {
  if (typeof window === 'undefined') return true
  return document.documentElement.dataset.themeEffects !== 'full'
    || (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
}

function useStaticIdle() {
  const [useStatic, setUseStatic] = useState(shouldUseStaticIdle)

  useEffect(() => {
    const sync = () => setUseStatic(shouldUseStaticIdle())
    const rootObserver = new MutationObserver(sync)
    const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-effects'],
    })
    reducedMotionQuery?.addEventListener('change', sync)
    sync()

    return () => {
      rootObserver.disconnect()
      reducedMotionQuery?.removeEventListener('change', sync)
    }
  }, [])

  return useStatic
}

function visualFor(action: PetAction, useStaticIdle: boolean, gifFailed: boolean) {
  if (action === 'pet') {
    return {
      src: PIXEL_OS_ASSETS.greyTabbyPet,
      alt: "Mittens, Leonardo's grey tabby, acknowledging a local pet",
    }
  }

  if (action === 'treat') {
    return {
      src: PIXEL_OS_ASSETS.greyTabbyTreat,
      alt: "Mittens, Leonardo's grey tabby, acknowledging a local treat",
    }
  }

  return {
    src: useStaticIdle || gifFailed
      ? PIXEL_OS_ASSETS.greyTabbyIdleStatic
      : PIXEL_OS_ASSETS.greyTabbyIdleGif,
    alt: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk",
  }
}

export function PixelPet() {
  const { openWindowById } = useWindows()
  const [action, setAction] = useState<PetAction>('idle')
  const [gifFailed, setGifFailed] = useState(false)
  const [nextPickIndex, setNextPickIndex] = useState(0)
  const [pick, setPick] = useState<PickDestination | null>(null)
  const [status, setStatus] = useState('Mittens is resting beside this local PixelOS desk.')
  const useStaticIdleFrame = useStaticIdle()
  const visual = visualFor(action, useStaticIdleFrame, gifFailed)

  const petMittens = () => {
    setAction('pet')
    setStatus('Mittens leans into a local pet.')
  }

  const treatMittens = () => {
    const nextPick = PICK_DESTINATIONS[nextPickIndex]
    setAction('treat')
    setPick(nextPick)
    setNextPickIndex((index) => (index + 1) % PICK_DESTINATIONS.length)
    setStatus(`Mittens accepts a local treat. Pick ready: ${nextPick.label}.`)
  }

  const resetCompanion = () => {
    setAction('idle')
    setPick(null)
    setNextPickIndex(0)
    setStatus('Mittens is resting beside this local PixelOS desk.')
  }

  const openPick = () => {
    if (!pick) return
    openWindowById(pick.id)
    setStatus(`Opened ${pick.label} by your explicit local action.`)
  }

  return (
    <section className={styles.root} aria-label="Desktop Pet">
      <div className={styles.scene} data-pet-action={action}>
        <img
          src={visual.src}
          alt={visual.alt}
          className={styles.catImage}
          onError={() => setGifFailed(true)}
        />
      </div>

      <div className={styles.panel}>
        <p className={styles.title}>{PET_DISPLAY_NAME}</p>
        <p className={styles.feedback} role="status" aria-live="polite">{status}</p>
        <div className={styles.actions} aria-label="Desktop Pet actions">
          <button type="button" onClick={petMittens}>PET MITTENS</button>
          <button type="button" onClick={treatMittens}>TREAT MITTENS</button>
          <button type="button" onClick={resetCompanion}>RESET</button>
        </div>
      </div>

      {pick ? (
        <section className={styles.pickCard} aria-label="Local Pick">
          <div className={styles.pickVisuals} aria-hidden="true">
            <img className={styles.pickSignature} src={PIXEL_OS_ASSETS.greyTabbyPickSignature} alt="" aria-hidden="true" />
            <img className={styles.pickPaw} src={PIXEL_OS_ASSETS.greyTabbyPaw} alt="" aria-hidden="true" />
          </div>
          <div>
            <p className={styles.pickHeading}>LOCAL PICK · {pick.label}</p>
            <p className={styles.pickReason}>{pick.reason}</p>
          </div>
          <button type="button" onClick={openPick}>OPEN {pick.label}</button>
        </section>
      ) : null}

      <div className="status-bar" aria-label="Desktop Pet status">
        <p className="status-bar-field">LOCAL COMPANION</p>
        <p className="status-bar-field">SESSION ONLY</p>
        <p className="status-bar-field">NO NETWORK</p>
      </div>
    </section>
  )
}
