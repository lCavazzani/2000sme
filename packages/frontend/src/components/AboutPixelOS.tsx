import { PIXEL_OS_ASSETS } from '../config/pixelosAssets'
import { useWindows } from '../store/windows'
import styles from './AboutPixelOS.module.css'

const SYSTEM_INFO = [
  ['Build', '2.0.0'],
  ['Shell', 'PixelOS web desktop'],
  ['Profile', 'Leonardo Cavazzani'],
] as const

export function AboutPixelOS() {
  const { closeWindow } = useWindows()

  return (
    <section className={styles.root} aria-label="About PixelOS">
      <div className={styles.mascotFrame}>
        <img
          src={PIXEL_OS_ASSETS.mascot}
          alt="PixelOS mascot in a small pixel-art scene"
          className={styles.mascot}
        />
      </div>
      <div className={styles.copy}>
        <p className={styles.version}>Pixel OS v2.0</p>
        <p>Your nostalgic desktop in the web.</p>
        <p>A tiny portfolio by Leonardo Cavazzani.</p>
        <dl className={styles.systemInfo} aria-label="PixelOS system information">
          {SYSTEM_INFO.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.actionRow}>
        <button type="button" className={styles.okButton} onClick={() => closeWindow('about')}>
          OK
        </button>
      </div>
    </section>
  )
}
