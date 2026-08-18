import { useTheme } from '../theme/ThemeProvider'

type ThemeSystemIconName = 'my-computer'

type ThemeSystemIconProps = {
  name: ThemeSystemIconName
  alt?: string
  width: number
  height: number
  className?: string
}

const SYSTEM_ICON_SOURCES = {
  win98: {
    'my-computer': '/theme-assets/win98/my-computer.ico',
  },
  winxp: {
    'my-computer': '/theme-assets/winxp/my-computer.ico',
  },
} as const

/**
 * Keeps a small number of documented system-affordance icons theme-specific
 * while portfolio application icons remain registry-owned and original.
 */
export function ThemeSystemIcon({ name, alt = '', width, height, className }: ThemeSystemIconProps) {
  const { theme } = useTheme()

  return <img src={SYSTEM_ICON_SOURCES[theme][name]} alt={alt} width={width} height={height} className={className} />
}
