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

const staticIconSources: Partial<Record<ApplicationId, string>> = {
  'my-computer': '/pixelos/icons/pixelos-my-machine-static-00.png',
  gallery: '/pixelos/icons/pixelos-gallery-static-00.png',
  pet: '/pixelos/icons/pixelos-desktop-pet-static-00.png',
  notepad: '/pixelos/icons/pixelos-readme-static-00.png',
  about: '/pixelos/icons/pixelos-about-me-static-00.png',
  resume: '/pixelos/icons/pixelos-resume-static-00.png',
}

const glyphs: Record<ThemeAssetIconName, ReactNode> = {
  start: <><rect x="1" y="1" width="6" height="6" fill="currentColor" /><rect x="8" y="1" width="3" height="3" fill="#4de3d0" /><rect x="8" y="5" width="3" height="6" fill="#df4fbc" /><rect x="1" y="8" width="6" height="3" fill="#6d5aa8" /></>,
  'my-computer': <><rect x="1" y="1" width="10" height="7" fill="currentColor" /><rect x="3" y="3" width="6" height="3" fill="#120b22" /><rect x="4" y="9" width="4" height="2" fill="currentColor" /></>,
  gallery: <><rect x="1" y="1" width="10" height="10" fill="currentColor" /><path d="M3 8l2-3 2 2 1-1 2 2" fill="none" stroke="#120b22" strokeWidth="1" /><rect x="3" y="3" width="2" height="2" fill="#4de3d0" /></>,
  pet: <><path d="M2 5 3 2l2 2h2l2-2 1 3v5H2z" fill="currentColor" /><path d="M4 7h1M7 7h1" stroke="#120b22" strokeWidth="1" /><path d="M5 9h2" stroke="#df4fbc" strokeWidth="1" /></>,
  notepad: <><rect x="2" y="1" width="8" height="10" fill="currentColor" /><path d="M4 4h4M4 6h4M4 8h3" stroke="#120b22" strokeWidth="1" /><rect x="2" y="2" width="8" height="1" fill="#4de3d0" /></>,
  minesweeper: <><rect x="1" y="1" width="10" height="10" fill="currentColor" /><path d="M6 2v8M2 6h8M3 3l6 6M9 3 3 9" stroke="#120b22" strokeWidth="1" /><rect x="5" y="5" width="2" height="2" fill="#df4fbc" /></>,
  about: <><rect x="1" y="1" width="10" height="10" fill="currentColor" /><path d="M6 3v4M6 9v1" stroke="#120b22" strokeWidth="2" /><rect x="5" y="2" width="2" height="2" fill="#4de3d0" /></>,
  resume: <><path d="M2 1h7l2 2v8H2z" fill="currentColor" /><path d="M4 5h5M4 7h5M4 9h3" stroke="#120b22" strokeWidth="1" /></>,
}

/**
 * Application identity remains registry-owned. Supplied static PixelOS frames
 * take precedence for application launchers; the inline glyph map remains only
 * for the Start control and a resilient fallback.
 */
export function ThemeAssetIcon({ name, alt = '', width, height, className }: ThemeAssetIconProps) {
  const staticIconSource = name === 'start' ? undefined : staticIconSources[name]

  return (
    <span className={`${styles.root} ${className ?? ''}`.trim()} aria-hidden={alt === '' ? true : undefined}>
      {staticIconSource ? (
        <img
          className={`${styles.icon} ${styles.raster}`}
          src={staticIconSource}
          alt={alt}
          width={width}
          height={height}
          draggable={false}
        />
      ) : (
        <svg className={styles.icon} width={width} height={height} viewBox="0 0 12 12" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
          {glyphs[name]}
        </svg>
      )}
    </span>
  )
}
