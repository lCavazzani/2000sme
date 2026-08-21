import { useCallback, useEffect, useState } from 'react'
import {
  createGameState,
  remainingMineEstimate,
  resetGame,
  revealCell,
  toggleFlag,
  type MinesweeperState,
} from '.'

function nextSeed(seed: number) {
  return (seed + 1) >>> 0
}

export function useMinesweeperGame() {
  const [game, setGame] = useState<MinesweeperState>(() => createGameState())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (game.status !== 'playing') return

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1)
    }, 1_000)

    return () => window.clearInterval(intervalId)
  }, [game.status])

  const reveal = useCallback((row: number, column: number) => {
    setGame((currentGame) => revealCell(currentGame, row, column))
  }, [])

  const flag = useCallback((row: number, column: number) => {
    setGame((currentGame) => toggleFlag(currentGame, row, column))
  }, [])

  const reset = useCallback(() => {
    setGame((currentGame) => resetGame(currentGame, nextSeed(currentGame.seed)))
    setElapsedSeconds(0)
  }, [])

  return {
    game,
    elapsedSeconds,
    remainingMines: remainingMineEstimate(game),
    reveal,
    flag,
    reset,
  }
}
