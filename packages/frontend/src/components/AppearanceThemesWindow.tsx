import { type ActiveThemeId, useTheme } from '../theme/ThemeProvider'
import styles from './AppearanceThemesWindow.module.css'

const options: Array<{ id: ActiveThemeId; label: string; description: string; preview: string }> = [
  { id: 'winxp', label: 'Windows XP', description: 'Luna desktop — default release theme.', preview: styles.winxp },
  { id: 'win98', label: 'Windows 98', description: 'Historic desktop — active release theme.', preview: styles.win98 },
]

export function AppearanceThemesWindow() {
  const { theme, setTheme } = useTheme()

  return (
    <section className={styles.appearance} aria-labelledby="appearance-heading">
      <p id="appearance-heading">
        Choose the look of your desktop. Open windows stay open while the theme changes.
      </p>
      <fieldset className={styles.options} aria-describedby="deferred-theme-note">
        <legend>Active desktop themes</legend>
        {options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              type="radio"
              name="desktop-theme"
              value={option.id}
              checked={theme === option.id}
              onChange={() => setTheme(option.id)}
            />
            <span className={`${styles.preview} ${option.preview}`} aria-hidden="true">
              <span />
            </span>
            <span className={styles.copy}>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <p className={styles.deferred} id="deferred-theme-note">
        <strong>Windows 7 preview:</strong> its runtime stylesheet is retained for technical reference,
        but it is deferred and not part of the active release compatibility target.
      </p>
    </section>
  )
}
