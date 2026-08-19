import { PIXEL_OS_ASSETS } from '../config/pixelosAssets'
import styles from './AboutPixelOS.module.css'

export function AboutPixelOS() {
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
      </div>
      <p className={styles.hint}>Use the window close control to return to the desktop.</p>
    </section>
  )
}
