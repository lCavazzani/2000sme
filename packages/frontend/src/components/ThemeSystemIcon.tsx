import type { ApplicationId } from '../config/applicationRegistry'
import styles from './ThemeSystemIcon.module.css'

export type ThemeAssetIconName = ApplicationId | 'start'

type ThemeAssetIconProps = {
  name: ThemeAssetIconName
  alt?: string
  width: number
  height: number
  className?: string
}

/**
 * Each supplied icon is deliberately assigned to an existing application
 * affordance. Application identity, launch behavior, routes, and window state
 * stay registry-owned; only the visual asset changes with the active theme.
 */
const THEME_ICON_SOURCES: Record<ThemeAssetIconName, { win98: string; winxp: string }> = {
  start: {
    win98: '/theme-assets/win98/portfolio.ico',
    winxp: '/theme-assets/winxp/start.ico',
  },
  portfolio: {
    win98: '/theme-assets/win98/portfolio.ico',
    winxp: '/theme-assets/winxp/portfolio.ico',
  },
  'my-computer': {
    win98: '/theme-assets/win98/my-computer.ico',
    winxp: '/theme-assets/winxp/my-computer.ico',
  },
  resume: {
    win98: '/theme-assets/win98/resume.ico',
    winxp: '/theme-assets/winxp/resume.ico',
  },
  guestbook: {
    win98: '/theme-assets/win98/guestbook.ico',
    winxp: '/theme-assets/winxp/guestbook.ico',
  },
  'about-me': {
    win98: '/theme-assets/win98/about-me.ico',
    winxp: '/theme-assets/winxp/about-me.ico',
  },
  contact: {
    win98: '/theme-assets/win98/contact.ico',
    winxp: '/theme-assets/winxp/contact.ico',
  },
  'appearance-themes': {
    win98: '/theme-assets/win98/appearance-themes.ico',
    winxp: '/theme-assets/winxp/appearance-themes.ico',
  },
}

/**
 * Renders both supplied theme variants and lets the root data attribute pick
 * the visible asset. This keeps switches synchronous with stylesheet swaps and
 * avoids adding theme-context requirements to isolated shell tests.
 */
export function ThemeAssetIcon({ name, alt = '', width, height, className }: ThemeAssetIconProps) {
  const source = THEME_ICON_SOURCES[name]
  const commonClassName = `${styles.icon} ${className ?? ''}`.trim()

  return (
    <span className={styles.root} aria-hidden={alt === '' ? true : undefined}>
      <img src={source.winxp} alt={alt} width={width} height={height} className={`${commonClassName} ${styles.winxp}`} />
      <img src={source.win98} alt="" width={width} height={height} className={`${commonClassName} ${styles.win98}`} />
    </span>
  )
}
