import type { ReactNode } from 'react'
export function DesktopIcon({ icon, label }: { icon: ReactNode; label: string }) { return <button type="button"><span aria-hidden="true">{icon}</span><span>{label}</span></button> }
