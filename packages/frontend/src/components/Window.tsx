import type { ReactNode } from 'react'
import { Rnd } from 'react-rnd'
import { useWindows } from '../store/windows'
import type { WindowState } from '../types/window'
import styles from './Window.module.css'

type WindowProps = {
  id: WindowState['id']
  children: ReactNode
}

export function Window({ id, children }: WindowProps) {
  const { windows, focusWindow, closeWindow, minimizeWindow, updateBounds } = useWindows()

  const win = windows.find((w) => w.id === id)
  if (!win || !win.isOpen || win.isMinimized) return null

  return (
    <Rnd
      position={{ x: win.x, y: win.y }}
      size={{ width: win.width, height: win.height }}
      style={{ zIndex: win.zIndex }}
      dragHandleClassName={styles.titleBar}
      minWidth={200}
      minHeight={150}
      enableResizing={{
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      }}
      onMouseDown={() => focusWindow(id)}
      onDragStop={(_e, d) => updateBounds(id, d.x, d.y, win.width, win.height)}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        updateBounds(id, pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)
      }
    >
      <div className={`window ${styles.window}`}>
        <div className={`title-bar ${styles.titleBar}`}>
          <div className="title-bar-text">
            {win.icon && (
              <img src={win.icon} alt="" width={16} height={16} className={styles.icon} />
            )}
            {win.title}
          </div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={() => minimizeWindow(id)} />
            <button aria-label="Maximize" />
            <button aria-label="Close" onClick={() => closeWindow(id)} />
          </div>
        </div>
        <div className="window-body">{children}</div>
      </div>
    </Rnd>
  )
}
