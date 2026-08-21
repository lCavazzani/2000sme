import { useRef, useState, type KeyboardEvent } from 'react'
import { cellDisplay, type MinesweeperCell as MinesweeperEngineCell, type MinesweeperState } from '../games/minesweeper'
import { MinesweeperCell } from './MinesweeperCell'
import styles from './MinesweeperWindow.module.css'

type MinesweeperBoardProps = {
  game: MinesweeperState
  onReveal: (row: number, column: number) => void
  onFlag: (row: number, column: number) => void
}

function clamp(value: number, lowerBound: number, upperBound: number) {
  return Math.min(Math.max(value, lowerBound), upperBound)
}

export function MinesweeperBoard({ game, onReveal, onFlag }: MinesweeperBoardProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const boardRef = useRef<HTMLDivElement>(null)

  function focusCell(index: number) {
    const clampedIndex = clamp(index, 0, game.cells.length - 1)
    setActiveIndex(clampedIndex)
    boardRef.current?.querySelector<HTMLButtonElement>(`[data-minesweeper-cell-index="${clampedIndex}"]`)?.focus()
  }

  function moveFocus(row: number, column: number) {
    const nextRow = clamp(row, 0, game.config.rows - 1)
    const nextColumn = clamp(column, 0, game.config.columns - 1)
    focusCell(nextRow * game.config.columns + nextColumn)
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLButtonElement>, cell: MinesweeperEngineCell) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(cell.row - 1, cell.column)
        return
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(cell.row + 1, cell.column)
        return
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(cell.row, cell.column - 1)
        return
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(cell.row, cell.column + 1)
        return
      case 'Home':
        event.preventDefault()
        moveFocus(cell.row, 0)
        return
      case 'End':
        event.preventDefault()
        moveFocus(cell.row, game.config.columns - 1)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        onReveal(cell.row, cell.column)
        return
      case 'f':
      case 'F':
        event.preventDefault()
        onFlag(cell.row, cell.column)
    }
  }

  return (
    <div
      ref={boardRef}
      className={styles.board}
      role="group"
      aria-label="Minesweeper board. Use arrow keys to move, Enter or Space to reveal, and F to flag."
      style={{ gridTemplateColumns: `repeat(${game.config.columns}, minmax(0, 1fr))` }}
    >
      {game.cells.map((cell) => (
        <MinesweeperCell
          key={cell.index}
          cell={cell}
          display={cellDisplay(cell)}
          gameStatus={game.status}
          isFocused={activeIndex === cell.index}
          onFocus={() => setActiveIndex(cell.index)}
          onReveal={() => onReveal(cell.row, cell.column)}
          onFlag={() => onFlag(cell.row, cell.column)}
          onKeyDown={(event) => handleCellKeyDown(event, cell)}
        />
      ))}
    </div>
  )
}
