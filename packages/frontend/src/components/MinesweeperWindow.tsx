import { useRef, useState, type KeyboardEvent } from 'react'
import { MinesweeperBoard } from './MinesweeperBoard'
import styles from './MinesweeperWindow.module.css'
import { useMinesweeperGame } from './useMinesweeperGame'

type ActiveMenu = 'game' | 'help' | null

function formatDisplayValue(value: number) {
  return String(Math.max(0, value)).padStart(3, '0')
}

function statusCopy(status: 'ready' | 'playing' | 'won' | 'lost') {
  switch (status) {
    case 'ready':
      return 'READY: REVEAL A CELL TO START.'
    case 'playing':
      return 'IN PROGRESS: ARROWS MOVE, ENTER REVEALS, F FLAGS.'
    case 'won':
      return 'CLEARED: EVERY SAFE CELL IS REVEALED.'
    case 'lost':
      return 'MINE DETONATED: START A NEW GAME TO TRY AGAIN.'
  }
}

function resetFace(status: 'ready' | 'playing' | 'won' | 'lost') {
  switch (status) {
    case 'won':
      return ':D'
    case 'lost':
      return 'X('
    default:
      return ':)'
  }
}

export function MinesweeperWindow() {
  const { game, elapsedSeconds, remainingMines, flag, reset, reveal } = useMinesweeperGame()
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null)
  const gameMenuButtonRef = useRef<HTMLButtonElement>(null)
  const helpMenuButtonRef = useRef<HTMLButtonElement>(null)

  function closeMenu(menu: Exclude<ActiveMenu, null>) {
    setActiveMenu(null)
    window.requestAnimationFrame(() => {
      if (menu === 'game') gameMenuButtonRef.current?.focus()
      if (menu === 'help') helpMenuButtonRef.current?.focus()
    })
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>, menu: Exclude<ActiveMenu, null>) {
    if (event.key !== 'Escape') return

    event.preventDefault()
    closeMenu(menu)
  }

  function startNewGame() {
    reset()
    closeMenu('game')
  }

  return (
    <section className={styles.root} aria-label="PixelOS Minesweeper">
      <div className={styles.menuBar} aria-label="Minesweeper menu bar">
        <div className={styles.menuGroup}>
          <button
            ref={gameMenuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={activeMenu === 'game'}
            aria-controls="minesweeper-game-menu"
            onClick={() => setActiveMenu((menu) => (menu === 'game' ? null : 'game'))}
          >
            Game
          </button>
          {activeMenu === 'game' && (
            <div
              id="minesweeper-game-menu"
              className={styles.menuPopup}
              role="menu"
              aria-label="Game menu"
              onKeyDown={(event) => handleMenuKeyDown(event, 'game')}
            >
              <button type="button" role="menuitem" onClick={startNewGame}>New game</button>
            </div>
          )}
        </div>

        <div className={styles.menuGroup}>
          <button
            ref={helpMenuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={activeMenu === 'help'}
            aria-controls="minesweeper-help-menu"
            onClick={() => setActiveMenu((menu) => (menu === 'help' ? null : 'help'))}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div
              id="minesweeper-help-menu"
              className={styles.menuPopup}
              role="menu"
              aria-label="Help menu"
              onKeyDown={(event) => handleMenuKeyDown(event, 'help')}
            >
              <button type="button" role="menuitem" onClick={() => closeMenu('help')}>Controls</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.gameSurface}>
        <div className={styles.dashboard}>
          <p className={styles.readout} aria-label={`${remainingMines} mines remaining`}>
            <span>MINES</span>
            <strong>{formatDisplayValue(remainingMines)}</strong>
          </p>
          <button
            type="button"
            className={styles.resetButton}
            aria-label="Start a new Minesweeper game"
            onClick={reset}
          >
            {resetFace(game.status)}
          </button>
          <p className={styles.readout} aria-label={`${elapsedSeconds} seconds elapsed`}>
            <span>TIME</span>
            <time dateTime={`PT${elapsedSeconds}S`}>{formatDisplayValue(elapsedSeconds)}</time>
          </p>
        </div>

        {activeMenu === 'help' && (
          <aside className={styles.helpPanel} aria-label="Minesweeper controls">
            <p><strong>CONTROLS</strong></p>
            <p>ARROWS MOVE. ENTER OR SPACE REVEALS. F FLAGS. RIGHT-CLICK ALSO FLAGS.</p>
          </aside>
        )}

        <MinesweeperBoard game={game} onReveal={reveal} onFlag={flag} />
      </div>

      <div className={styles.statusBar} data-minesweeper-status={game.status} role="status" aria-live="polite">
        {statusCopy(game.status)}
      </div>
    </section>
  )
}
