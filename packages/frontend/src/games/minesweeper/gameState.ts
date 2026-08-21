import { createEmptyBoard, validateConfig } from './board'
import type { MinesweeperConfig, MinesweeperState } from './types'

export const DEFAULT_MINESWEEPER_CONFIG: MinesweeperConfig = {
  rows: 9,
  columns: 9,
  mineCount: 10,
}

export const DEFAULT_MINESWEEPER_SEED = 0x51a7e

export function createGameState(
  config: MinesweeperConfig = DEFAULT_MINESWEEPER_CONFIG,
  seed = DEFAULT_MINESWEEPER_SEED,
): MinesweeperState {
  validateConfig(config)
  return {
    config: { ...config },
    seed,
    status: 'ready',
    isInitialized: false,
    cells: createEmptyBoard(config),
  }
}

export function resetGame(state: MinesweeperState, seed = state.seed): MinesweeperState {
  return createGameState(state.config, seed)
}
