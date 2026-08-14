import type { WindowConfig } from '../types/window'

export type DesktopApp = WindowConfig & {
  label: string
  icon: string
}

export const desktopApps: DesktopApp[] = [
  {
    id: 'my-computer',
    label: 'My Computer',
    title: 'My Computer',
    icon: '/desktop-icons/my-computer.svg',
    x: 72,
    y: 64,
    width: 460,
    height: 300,
  },
  {
    id: 'resume',
    label: 'Resume',
    title: 'Resume',
    icon: '/desktop-icons/resume.svg',
    x: 116,
    y: 96,
    width: 520,
    height: 560,
  },
  {
    id: 'guestbook',
    label: 'Guestbook',
    title: 'Guestbook',
    icon: '/desktop-icons/guestbook.svg',
    x: 156,
    y: 124,
    width: 440,
    height: 380,
  },
  {
    id: 'about-me',
    label: 'About Me',
    title: 'About Me',
    icon: '/desktop-icons/about-me.svg',
    x: 196,
    y: 152,
    width: 420,
    height: 320,
  },
]

export function findDesktopApp(id: string) {
  return desktopApps.find((app) => app.id === id)
}
