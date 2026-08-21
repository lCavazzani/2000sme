import type { KeyboardEvent, MouseEvent } from 'react'
import type { CellDisplay, GameStatus, MinesweeperCell } from '../games/minesweeper'
import styles from './MinesweeperWindow.module.css'

type MinesweeperCellProps = {
  cell: MinesweeperCell
  display: CellDisplay
  gameStatus: GameStatus
  isFocused: boolean
  onFocus: () => void
  onReveal: () => void
  onFlag: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}

function displayForCell(display: CellDisplay, gameStatus: GameStatus, cell: MinesweeperCell): CellDisplay {
  if (gameStatus === 'lost' && cell.isMine) return { kind: 'mine' }
  return display
}

function cellLabel(display: CellDisplay, cell: MinesweeperCell) {
  const position = `Row ${cell.row + 1}, column ${cell.column + 1}`

  switch (display.kind) {
    case 'hidden':
      return `${position}, covered cell`
    case 'flagged':
      return `${position}, flagged cell`
    case 'mine':
      return `${position}, mine`
    case 'empty':
      return `${position}, revealed with no adjacent mines`
    case 'number':
      return `${position}, revealed with ${display.value} adjacent mine${display.value === 1 ? '' : 's'}`
  }
}

function cellContent(display: CellDisplay) {
  switch (display.kind) {
    case 'flagged':
      return 'F'
    case 'mine':
      return '*'
    case 'number':
      return String(display.value)
    default:
      return ''
  }
}

export function MinesweeperCell({
  cell,
  display,
  gameStatus,
  isFocused,
  onFocus,
  onReveal,
  onFlag,
  onKeyDown,
}: MinesweeperCellProps) {
  const visibleDisplay = displayForCell(display, gameStatus, cell)
  const isCovered = visibleDisplay.kind === 'hidden' || visibleDisplay.kind === 'flagged'

  function handleClick() {
    if (visibleDisplay.kind === 'hidden') onReveal()
  }

  function handleContextMenu(event: MouseEvent<HTMLButtonElement>) {
    if (!isCovered) return

    event.preventDefault()
    onFlag()
  }

  return (
    <button
      type="button"
      className={styles.cell}
      data-minesweeper-cell={`${cell.row}-${cell.column}`}
      data-minesweeper-cell-index={cell.index}
      data-cell-state={visibleDisplay.kind}
      data-cell-number={visibleDisplay.kind === 'number' ? visibleDisplay.value : undefined}
      aria-label={cellLabel(visibleDisplay, cell)}
      aria-keyshortcuts="Enter Space F"
      tabIndex={isFocused ? 0 : -1}
      onFocus={onFocus}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden="true">{cellContent(visibleDisplay)}</span>
    </button>
  )
}
