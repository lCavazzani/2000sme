import type { ReactNode } from 'react'
export function TitleBar({ title, controls }: { title: string; controls?: ReactNode }) { return <div className="title-bar"><div className="title-bar-text">{title}</div>{controls && <div className="title-bar-controls">{controls}</div>}</div> }
