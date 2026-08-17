import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Rnd } from 'react-rnd'
import { useWindows } from '../store/windows'
import type { WindowState } from '../types/window'
import styles from './Window.module.css'

type WindowProps = {
  id: WindowState['id']
  children: ReactNode
}

function focusLauncher(id: string) {
  window.setTimeout(() => {
    const launcher = document.querySelector<HTMLElement>(`[data-window-launcher="${id}"]`)
      ?? document.querySelector<HTMLElement>(`[data-window-taskbar="${id}"]`)
      ?? document.querySelector<HTMLElement>('[data-desktop-root]')
    launcher?.focus()
  }, 0)
}

function isTextEntryTarget(target: EventTarget | null) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
}

export function Window({ id, children }: WindowProps) {
  const {
    windows,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    resetWindowBounds,
    updateBounds,
  } = useWindows()
  const windowRef = useRef<HTMLDivElement>(null)

  const win = windows.find((windowState) => windowState.id === id)
  const shouldFocus = Boolean(win?.isOpen && !win?.isMinimized)
  const windowZIndex = win?.zIndex
  const activeWindowZIndex = Math.max(
    ...windows
      .filter((windowState) => windowState.isOpen && !windowState.isMinimized)
      .map((windowState) => windowState.zIndex),
  )
  const isActive = windowZIndex === activeWindowZIndex

  useEffect(() => {
    if (!shouldFocus) return

    const frame = window.requestAnimationFrame(() => {
      const windowElement = windowRef.current
      if (!windowElement) return

      // A pointer interaction can raise this window before the browser focuses
      // a descendant form control. Preserve that real control focus instead of
      // returning focus to the dialog container after the state update.
      if (windowElement.contains(document.activeElement)) return
      windowElement.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [shouldFocus, windowZIndex])

  const minimize = useCallback(() => {
    minimizeWindow(id)
    focusLauncher(id)
  }, [id, minimizeWindow])

  const close = useCallback(() => {
    closeWindow(id)
    focusLauncher(id)
  }, [closeWindow, id])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (isTextEntryTarget(event.target)) return

      if (event.altKey && event.key === 'F9') {
        event.preventDefault()
        minimize()
      } else if (event.altKey && event.key === 'F10') {
        event.preventDefault()
        toggleMaximizeWindow(id)
      } else if (event.altKey && event.key === 'Home') {
        event.preventDefault()
        resetWindowBounds(id)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    },
    [close, id, minimize, resetWindowBounds, toggleMaximizeWindow],
  )

  if (!win || !win.isOpen || win.isMinimized) return null

  const resizing = win.isMaximized
    ? false
    : {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }

  return (
    <Rnd
      position={{ x: win.x, y: win.y }}
      size={{ width: win.width, height: win.height }}
      style={{ zIndex: win.zIndex }}
      dragHandleClassName={styles.titleBar}
      cancel=".title-bar-controls"
      minWidth={200}
      minHeight={150}
      disableDragging={win.isMaximized}
      enableResizing={resizing}
      onMouseDown={() => focusWindow(id)}
      onDragStop={(_event, drag) => updateBounds(id, { x: drag.x, y: drag.y, width: win.width, height: win.height })}
      onResizeStop={(_event, _direction, ref, _delta, position) =>
        updateBounds(id, {
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        })
      }
    >
      <div
        ref={windowRef}
        className={`window ${styles.window}`}
        data-window-active={isActive}
        tabIndex={-1}
        role="dialog"
        aria-label={`${win.title} window`}
        aria-keyshortcuts="Alt+F9 Alt+F10 Alt+Home Escape"
        onFocus={() => focusWindow(id)}
        onKeyDown={handleKeyDown}
      >
        <div
          className={`title-bar ${styles.titleBar}`}
          onDoubleClick={() => toggleMaximizeWindow(id)}
        >
          <div className="title-bar-text">
            {win.icon && <img src={win.icon} alt="" width={16} height={16} className={styles.icon} />}
            {win.title}
          </div>
          <div className="title-bar-controls">
            <button
              aria-label="Minimize"
              aria-keyshortcuts="Alt+F9"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={minimize}
            />
            <button
              className={styles.maximizeControl}
              data-window-control={win.isMaximized ? 'restore' : 'maximize'}
              aria-label={win.isMaximized ? 'Restore window' : 'Maximize window'}
              aria-keyshortcuts="Alt+F10"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => toggleMaximizeWindow(id)}
            >
              {win.isMaximized ? (
                <svg className={styles.windowControlGlyph} data-window-control-glyph="restore" viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="5" y="3" width="8" height="8" />
                  <path d="M3 5v8h8" />
                </svg>
              ) : (
                <svg className={styles.windowControlGlyph} data-window-control-glyph="maximize" viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="4" y="4" width="8" height="8" />
                </svg>
              )}
            </button>
            <button
              aria-label="Close"
              aria-keyshortcuts="Escape"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={close}
            />
          </div>
        </div>
        <div className="window-body">{children}</div>
      </div>
    </Rnd>
  )
}
