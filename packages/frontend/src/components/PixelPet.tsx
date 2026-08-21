import { useState } from 'react'
import { PIXEL_OS_ASSETS } from '../config/pixelosAssets'
import styles from './PixelPet.module.css'

type PetAction = 'idle' | 'pet' | 'feed'

const FEEDBACK: Record<PetAction, string> = {
  idle: 'Mittens is watching the PixelOS skyline.',
  pet: 'Mittens purrs and leans into your hand.',
  feed: 'Mittens accepts a pixel snack and flicks a happy tail.',
}

export function PixelPet() {
  const [action, setAction] = useState<PetAction>('idle')
  const hearts = action === 'feed' ? 3 : action === 'pet' ? 2 : 1

  return (
    <section className={styles.root} aria-label="Desktop Pet">
      <div className={styles.scene} data-pet-action={action}>
        <img
          src={PIXEL_OS_ASSETS.mittens}
          alt="Mittens, an orange cat resting on a windowsill"
          className={styles.catImage}
        />
        <div className={styles.hearts} aria-hidden="true">
          {Array.from({ length: hearts }, (_, index) => <span key={index} aria-hidden="true">♥</span>)}
        </div>
      </div>

      <div className={styles.panel}>
        <p className={styles.title}>MITTENS.EXE</p>
        <p className={styles.feedback} role="status" aria-live="polite">{FEEDBACK[action]}</p>
        <div className={styles.actions}>
          <button type="button" onClick={() => setAction('pet')}>Pet Mittens</button>
          <button type="button" onClick={() => setAction('feed')}>Feed Mittens</button>
        </div>
      </div>

      <div className="status-bar" aria-label="Desktop Pet status">
        <p className="status-bar-field">LOCAL COMPANION</p>
        <p className="status-bar-field">NO NETWORK</p>
      </div>
    </section>
  )
}
