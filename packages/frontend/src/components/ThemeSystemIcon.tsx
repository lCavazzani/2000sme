import type { ReactNode } from 'react'
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

const glyphs: Record<ThemeAssetIconName, ReactNode> = {
  start: <><rect x="1" y="1" width="6" height="6" fill="currentColor" /><rect x="8" y="1" width="3" height="3" fill="#4de3d0" /><rect x="8" y="5" width="3" height="6" fill="#df4fbc" /><rect x="1" y="8" width="6" height="3" fill="#6d5aa8" /></>,
  portfolio: <><path d="M1 4h10v7H1z" fill="currentColor" /><path d="M3 2h6v2H3z" fill="#4de3d0" /></>,
  'my-computer': <><rect x="1" y="1" width="10" height="7" fill="currentColor" /><rect x="3" y="3" width="6" height="3" fill="#120b22" /><rect x="4" y="9" width="4" height="2" fill="currentColor" /></>,
  resume: <><path d="M2 1h7l2 2v8H2z" fill="currentColor" /><path d="M4 5h5M4 7h5M4 9h3" stroke="#120b22" strokeWidth="1" /></>,
  guestbook: <><path d="M1 2h10v7H5l-3 2V2z" fill="currentColor" /><path d="M3 4h6M3 6h4" stroke="#120b22" strokeWidth="1" /></>,
  'about-me': <><circle cx="6" cy="4" r="3" fill="currentColor" /><path d="M1 11c1-3 9-3 10 0z" fill="currentColor" /></>,
  contact: <><rect x="1" y="3" width="10" height="7" fill="currentColor" /><path d="m2 4 4 3 4-3" fill="none" stroke="#120b22" strokeWidth="1" /></>,
  'appearance-themes': <><path d="M6 1 7 3l2 .5-1.5 1.5.4 2L6 6l-1.9 1 .4-2L3 3.5 5 3zM2 8h8v3H2z" fill="currentColor" /></>,
}

/**
 * Application identity remains registry-owned. PixelOS supplies a compact
 * inline glyph for each stable launcher ID, avoiding legacy XP/98 asset swaps
 * while keeping isolated shell tests free of theme-context requirements.
 */
export function ThemeAssetIcon({ name, alt = '', width, height, className }: ThemeAssetIconProps) {
  return (
    <span className={`${styles.root} ${className ?? ''}`.trim()} aria-hidden={alt === '' ? true : undefined}>
      <svg className={styles.icon} width={width} height={height} viewBox="0 0 12 12" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        {glyphs[name]}
      </svg>
    </span>
  )
}
