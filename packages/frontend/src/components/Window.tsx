import type { ReactNode } from 'react'
import styles from './Window.module.css'

type WindowProps = {
  title: string
  icon?: string
  children: ReactNode
  onClose: () => void
  onMinimize: () => void
  isFocused?: boolean;
}

export function Window({ title, icon, children, onClose, onMinimize }: WindowProps) {
  return (
    <div className={`window ${styles.window}`}>
      <div className="title-bar">
        <div className="title-bar-text">
          {icon && <img src={icon} alt="" width={16} height={16} className={styles.icon} />}
          {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label="Maximize" />
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  )
}
