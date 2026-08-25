import { useEffect, useLayoutEffect, useState } from 'react'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
import type { ApplicationId } from '../../config/applicationRegistry'
import { useWindows } from '../../store/windows'
import styles from './PixelPet.module.css'

type PetAction = 'idle' | 'pet' | 'treat'
type AcknowledgementFrame = 0 | 1 | 2

type PickDestination = {
  id: ApplicationId
  label: string
  reason: string
}

type PetVisual = {
  src: string
  alt: string
}

const PET_DISPLAY_NAME = 'MITTENS.EXE'
const ACKNOWLEDGEMENT_STEP_MS = 180

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

const petReadableFrames = [
  PIXEL_OS_ASSETS.greyTabbyPetReadableStatic,
  PIXEL_OS_ASSETS.greyTabbyPetReadableFrameOne,
  PIXEL_OS_ASSETS.greyTabbyPetReadableFrameTwo,
] as const

const treatReachFrames = [
  PIXEL_OS_ASSETS.greyTabbyTreatReachFrameZero,
  PIXEL_OS_ASSETS.greyTabbyTreatReachFrameOne,
  PIXEL_OS_ASSETS.greyTabbyTreatReachFrameTwo,
] as const

function shouldUseStaticVisual() {
  if (typeof window === 'undefined') return true
  return document.documentElement.dataset.themeEffects !== 'full'
    || (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
}

function useStaticVisual() {
  const [useStatic, setUseStatic] = useState(shouldUseStaticVisual)

  useEffect(() => {
    const sync = () => setUseStatic(shouldUseStaticVisual())
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

function visualFor(
  action: PetAction,
  useStaticFrame: boolean,
  visualFailed: boolean,
  acknowledgementFrame: AcknowledgementFrame,
): PetVisual {
  if (action === 'pet') {
    return {
      src: useStaticFrame || visualFailed
        ? PIXEL_OS_ASSETS.greyTabbyPetReadableStatic
        : petReadableFrames[acknowledgementFrame],
      alt: "Mittens, Leonardo's grey tabby, acknowledging a local pet",
    }
  }

  if (action === 'treat') {
    return {
      src: useStaticFrame || visualFailed
        ? PIXEL_OS_ASSETS.greyTabbyTreatStatic
        : treatReachFrames[acknowledgementFrame],
      alt: "Mittens, Leonardo's grey tabby, acknowledging a local treat",
    }
  }

  return {
    src: useStaticFrame || visualFailed
      ? PIXEL_OS_ASSETS.greyTabbyIdleStatic
      : PIXEL_OS_ASSETS.greyTabbyIdleGif,
    alt: "Mittens, Leonardo's grey tabby, resting beside the PixelOS desk",
  }
}

export function PixelPet() {
  const { openWindowById } = useWindows()
  const [action, setAction] = useState<PetAction>('idle')
  const [visualFailed, setVisualFailed] = useState(false)
  const [acknowledgementFrame, setAcknowledgementFrame] = useState<AcknowledgementFrame>(0)
  const [nextPickIndex, setNextPickIndex] = useState(0)
  const [pick, setPick] = useState<PickDestination | null>(null)
  const [status, setStatus] = useState('Mittens is resting beside this local PixelOS desk.')
  const useStaticFrame = useStaticVisual()
  const visual = visualFor(action, useStaticFrame, visualFailed, acknowledgementFrame)

  useLayoutEffect(() => {
    if (action === 'idle' || useStaticFrame || visualFailed) {
      setAcknowledgementFrame(0)
      return
    }

    const secondFrame = window.setTimeout(() => setAcknowledgementFrame(1), ACKNOWLEDGEMENT_STEP_MS)
    const finalFrame = window.setTimeout(() => setAcknowledgementFrame(2), ACKNOWLEDGEMENT_STEP_MS * 2)

    return () => {
      window.clearTimeout(secondFrame)
      window.clearTimeout(finalFrame)
    }
  }, [action, useStaticFrame, visualFailed])

  const petMittens = () => {
    setVisualFailed(false)
    setAcknowledgementFrame(0)
    setAction('pet')
    setStatus('Mittens leans into a local pet.')
  }

  const treatMittens = () => {
    const nextPick = PICK_DESTINATIONS[nextPickIndex]
    setVisualFailed(false)
    setAcknowledgementFrame(0)
    setAction('treat')
    setPick(nextPick)
    setNextPickIndex((index) => (index + 1) % PICK_DESTINATIONS.length)
    setStatus(`Mittens accepts a local treat. Pick ready: ${nextPick.label}.`)
  }

  const resetCompanion = () => {
    setVisualFailed(false)
    setAcknowledgementFrame(0)
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
      <div className={styles.scene} data-pet-action={action} data-acknowledgement-frame={acknowledgementFrame}>
        <img
          src={visual.src}
          alt={visual.alt}
          className={styles.catImage}
          onError={() => setVisualFailed(true)}
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
