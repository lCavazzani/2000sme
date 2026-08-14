import type { ReactNode } from 'react'
export function Menu({ label, children }: { label: string; children: ReactNode }) { return <ul role="menu" aria-label={label}>{children}</ul> }
