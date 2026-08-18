import styles from './ThemeSystemIcon.module.css'

type ThemeSystemIconName = 'my-computer'

type ThemeSystemIconProps = {
  name: ThemeSystemIconName
  alt?: string
  width: number
  height: number
  className?: string
}

const SYSTEM_ICON_SOURCES = {
  'my-computer': {
    win98: '/theme-assets/win98/my-computer.ico',
    winxp: '/theme-assets/winxp/my-computer.ico',
  },
} as const

/**
 * Renders both documented theme variants and lets the root data attribute pick
 * the visible asset. This keeps icon changes synchronous with stylesheet swaps
 * and avoids adding theme-context requirements to isolated shell tests.
 */
export function ThemeSystemIcon({ name, alt = '', width, height, className }: ThemeSystemIconProps) {
  const source = SYSTEM_ICON_SOURCES[name]
  const commonClassName = `${styles.icon} ${className ?? ''}`.trim()

  return (
    <span className={styles.root} aria-hidden={alt === '' ? true : undefined}>
      <img src={source.winxp} alt={alt} width={width} height={height} className={`${commonClassName} ${styles.winxp}`} />
      <img src={source.win98} alt="" width={width} height={height} className={`${commonClassName} ${styles.win98}`} />
    </span>
  )
}
