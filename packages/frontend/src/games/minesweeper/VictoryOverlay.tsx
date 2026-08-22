import { useEffect, useRef, type CSSProperties } from 'react'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
import styles from './MinesweeperWindow.module.css'

type VictoryOverlayProps = {
  elapsedSeconds: number
  onNewGame: () => void
}

function formatDisplayValue(value: number) {
  return String(Math.max(0, value)).padStart(3, '0')
}

/**
 * A local board-completion panel. It intentionally is not a dialog or live
 * region: the retained status bar is the sole win announcement source.
 */
export function VictoryOverlay({ elapsedSeconds, onNewGame }: VictoryOverlayProps) {
  const newGameButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    newGameButtonRef.current?.focus()
  }, [])

  return (
    <section className={styles.victoryOverlay} aria-labelledby="minesweeper-victory-title">
      <div
        className={styles.victorySparks}
        aria-hidden="true"
        style={{ '--victory-burst': `url(${PIXEL_OS_ASSETS.minesweeperVictoryBurst})` } as CSSProperties}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <span className={styles.victorySpark} style={{ '--spark-index': index } as CSSProperties} key={index} />
        ))}
      </div>
      <div className={styles.victoryCard}>
        <h2 id="minesweeper-victory-title">ALL CLEAR</h2>
        <p>BOARD SECURED</p>
        <time dateTime={`PT${elapsedSeconds}S`}>TIME {formatDisplayValue(elapsedSeconds)}</time>
        <button ref={newGameButtonRef} type="button" onClick={onNewGame}>NEW GAME</button>
      </div>
    </section>
  )
}
