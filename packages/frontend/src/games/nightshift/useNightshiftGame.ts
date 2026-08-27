import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWindows } from '../../store/windows'
import { readNightshiftLocalState, writeNightshiftLocalState } from './localState'
import {
  DEFAULT_NIGHTSHIFT_INPUT,
  createNightshiftState,
  pauseNightshift,
  restartNightshift,
  resumeNightshift,
  startNightshift,
  tickNightshift,
  type NightshiftInput,
  type NightshiftState,
} from '.'

const NIGHTSHIFT_WINDOW_ID = 'nightshift'

function isWindowActive(windows: ReturnType<typeof useWindows>['windows']) {
  const current = windows.find((windowState) => windowState.id === NIGHTSHIFT_WINDOW_ID)
  if (!current?.isOpen || current.isMinimized) return false

  const activeZIndex = Math.max(
    ...windows
      .filter((windowState) => windowState.isOpen && !windowState.isMinimized)
      .map((windowState) => windowState.zIndex),
  )
  return current.zIndex === activeZIndex
}

export function useNightshiftGame() {
  const { windows } = useWindows()
  const [game, setGameState] = useState<NightshiftState>(() => createNightshiftState())
  const [localState, setLocalState] = useState(readNightshiftLocalState)
  const gameRef = useRef(game)
  const inputRef = useRef<NightshiftInput>(DEFAULT_NIGHTSHIFT_INPUT)
  const frameRef = useRef<number | undefined>(undefined)
  const previousFrameRef = useRef<number | undefined>(undefined)
  const active = useMemo(() => {
    const directRoute = typeof window !== 'undefined' && window.location.hash === '#/apps/nightshift'
    return directRoute || isWindowActive(windows)
  }, [windows])

  const setGame = useCallback((nextGame: NightshiftState | ((current: NightshiftState) => NightshiftState)) => {
    setGameState((current) => {
      const next = typeof nextGame === 'function' ? nextGame(current) : nextGame
      gameRef.current = next
      return next
    })
  }, [])

  const setInput = useCallback((patch: Partial<NightshiftInput>) => {
    inputRef.current = { ...inputRef.current, ...patch }
  }, [])

  const clearInput = useCallback(() => {
    inputRef.current = DEFAULT_NIGHTSHIFT_INPUT
  }, [])

  const tapInput = useCallback((patch: Partial<NightshiftInput>) => {
    setGame((current) => tickNightshift(current, { ...DEFAULT_NIGHTSHIFT_INPUT, ...patch }, 100))
  }, [setGame])

  const start = useCallback(() => {
    setGame((current) => startNightshift(current))
  }, [setGame])

  const pause = useCallback(() => {
    clearInput()
    setGame((current) => pauseNightshift(current))
  }, [clearInput, setGame])

  const resume = useCallback(() => {
    setGame((current) => resumeNightshift(current))
  }, [setGame])

  const restart = useCallback(() => {
    clearInput()
    setGame((current) => restartNightshift(current))
  }, [clearInput, setGame])

  useEffect(() => {
    const bestDistance = Math.max(localState.bestDistance, Math.floor(game.distance))
    if (bestDistance === localState.bestDistance) return
    const nextLocalState = { ...localState, bestDistance }
    setLocalState(nextLocalState)
    writeNightshiftLocalState(nextLocalState)
  }, [game.distance, localState])

  const toggleGuide = useCallback(() => {
    setLocalState((current) => {
      const nextLocalState = { ...current, showGuide: !current.showGuide }
      writeNightshiftLocalState(nextLocalState)
      return nextLocalState
    })
  }, [])

  useEffect(() => {
    if (active || gameRef.current.status !== 'playing') return
    pause()
  }, [active, pause])

  useEffect(() => {
    if (!active || game.status !== 'playing') return

    const onFrame = (timestamp: number) => {
      const previousTimestamp = previousFrameRef.current ?? timestamp
      previousFrameRef.current = timestamp
      setGame((current) => tickNightshift(current, inputRef.current, timestamp - previousTimestamp))
      frameRef.current = window.requestAnimationFrame(onFrame)
    }

    frameRef.current = window.requestAnimationFrame(onFrame)
    return () => {
      if (frameRef.current !== undefined) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = undefined
      previousFrameRef.current = undefined
    }
  }, [active, game.status, setGame])

  useEffect(() => () => {
    if (frameRef.current !== undefined) window.cancelAnimationFrame(frameRef.current)
  }, [])

  return {
    active,
    game,
    bestDistance: localState.bestDistance,
    showGuide: localState.showGuide,
    toggleGuide,
    start,
    pause,
    resume,
    restart,
    setInput,
    tapInput,
    clearInput,
  }
}
