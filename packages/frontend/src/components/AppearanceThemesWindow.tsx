import { type EffectsPreference, useTheme } from '../theme/ThemeProvider'
import styles from './AppearanceThemesWindow.module.css'

const effectsOptions: Array<{ id: EffectsPreference; label: string; description: string }> = [
  { id: 'system', label: 'Follow device preference', description: 'Use the operating system reduced-motion setting.' },
  { id: 'reduced', label: 'Reduce PixelOS effects', description: 'Keep the desktop fully usable while removing optional scanlines, blinking, and sprite motion.' },
]

export function AppearanceThemesWindow() {
  const { effectsPreference, setEffectsPreference } = useTheme()

  return (
    <section className={styles.appearance} aria-labelledby="appearance-heading">
      <p id="appearance-heading">
        PixelOS is the active desktop experience. This panel controls optional visual effects only.
      </p>
      <fieldset className={styles.effects}>
        <legend>PixelOS effects</legend>
        <p>Effects never change content, form controls, keyboard behavior, or window actions.</p>
        {effectsOptions.map((option) => (
          <label className={styles.effectOption} key={option.id}>
            <input
              type="radio"
              name="pixelos-effects"
              value={option.id}
              checked={effectsPreference === option.id}
              onChange={() => setEffectsPreference(option.id)}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
    </section>
  )
}
