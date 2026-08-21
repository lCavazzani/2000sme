import styles from './MinesweeperPlaceholder.module.css'

/**
 * GAME-1 registers the future PixelOS Minesweeper launch surface without
 * rendering any gameplay. GAME-2 and TEST-8 establish the pure rules engine
 * before GAME-3 attaches a board, counter, timer, or game controls.
 */
export function MinesweeperPlaceholder() {
  return (
    <section className={styles.placeholder} aria-labelledby="minesweeper-ready-title">
      <p className={styles.eyebrow}>PIXELOS GAMES</p>
      <h2 id="minesweeper-ready-title">MINESWEEPER.EXE</h2>
      <p>The launcher and direct route are ready. The rules engine is being prepared before the game grid is rendered.</p>
      <p className={styles.status} role="status">GAME ENGINE: PENDING RULES VALIDATION</p>
    </section>
  )
}
