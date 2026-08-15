import type { WindowConfig } from '../types/window'

export type DesktopApp = WindowConfig & { label: string; icon: string }

export const desktopApps: DesktopApp[] = [
  { id: 'my-computer', label: 'My Computer', title: 'My Computer', icon: '/desktop-icons/my-computer.svg', x: 72, y: 48, width: 640, height: 440 },
  { id: 'resume', label: 'Resume', title: 'resume.md - WordPad', icon: '/desktop-icons/resume.svg', x: 96, y: 48, width: 760, height: 540 },
  { id: 'guestbook', label: 'Guestbook', title: 'Guestbook', icon: '/desktop-icons/guestbook.svg', x: 156, y: 124, width: 440, height: 380 },
  { id: 'about-me', label: 'About Me', title: 'About Me', icon: '/desktop-icons/about-me.svg', x: 196, y: 152, width: 420, height: 320 },
  { id: 'appearance-themes', label: 'Control Panel', title: 'Appearance & Themes', icon: '/desktop-icons/control-panel.svg', x: 236, y: 180, width: 540, height: 390 },
]

export function findDesktopApp(id: string) { return desktopApps.find((app) => app.id === id) }
