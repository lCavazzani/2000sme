import type { ReactNode } from 'react'
export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) { return <fieldset><legend>{legend}</legend>{children}</fieldset> }
