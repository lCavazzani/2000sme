import { type ThemeId, useTheme } from '../theme/ThemeProvider'
import styles from './AppearanceThemesWindow.module.css'

const options: Array<{ id: ThemeId; label: string; description: string; preview: string }> = [
  { id: 'win98', label: 'Windows 98', description: 'Classic gray controls and a teal desktop.', preview: styles.win98 },
  { id: 'winxp', label: 'Windows XP', description: 'A blue Luna-style interface.', preview: styles.winxp },
  { id: 'win7', label: 'Windows 7', description: 'A glossy glass-inspired interface.', preview: styles.win7 },
]

export function AppearanceThemesWindow() {
  const { theme, setTheme } = useTheme()
  return <section className={styles.appearance} aria-labelledby="appearance-heading"><p id="appearance-heading">Choose the look of your desktop. Open windows stay open while the theme changes.</p><fieldset className={styles.options}><legend>Desktop theme</legend>{options.map((option) => <label className={styles.option} key={option.id}><input type="radio" name="desktop-theme" value={option.id} checked={theme === option.id} onChange={() => setTheme(option.id)} /><span className={`${styles.preview} ${option.preview}`} aria-hidden="true"><span /></span><span className={styles.copy}><strong>{option.label}</strong><small>{option.description}</small></span></label>)}</fieldset></section>
}
