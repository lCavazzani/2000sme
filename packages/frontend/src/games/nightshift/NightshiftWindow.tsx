import { useCallback } from 'react'
import { NightshiftCanvas } from './NightshiftCanvas'
import { speedLabel, statusLabel } from './types'
import { useNightshiftGame } from './useNightshiftGame'
import styles from './NightshiftWindow.module.css'

export function NightshiftWindow() {
  const {
    active,
    game,
    start,
    pause,
    resume,
    restart,
    setInput,
    tapInput,
    clearInput,
  } = useNightshiftGame()

  const toggleRun = useCallback(() => {
    if (game.status === 'ready') start()
    else if (game.status === 'playing') pause()
    else if (game.status === 'paused') resume()
    else restart()
  }, [game.status, pause, restart, resume, start])

  const runLabel = game.status === 'ready'
    ? 'START SHIFT'
    : game.status === 'playing'
      ? 'PAUSE'
      : game.status === 'paused'
        ? 'RESUME'
        : 'RESTART SHIFT'

  return (
    <section className={styles.window} aria-labelledby="nightshift-heading">
      <header className={styles.header}>
        <h2 id="nightshift-heading" className={styles.title}>NIGHTSHIFT.EXE</h2>
        <output className={styles.status} aria-live="polite">{statusLabel(game.status)}</output>
      </header>

      <div className={styles.stage}>
        <NightshiftCanvas game={game} tapInput={tapInput} clearInput={clearInput} onToggleRun={toggleRun} />
      </div>

      <div className={styles.controls} aria-label="NIGHTSHIFT controls">
        <button type="button" onClick={toggleRun} disabled={!active && game.status !== 'ready'}>{runLabel}</button>
        <button type="button" onClick={restart}>RESET</button>
        <button type="button" onPointerDown={() => setInput({ steer: -1 })} onPointerUp={clearInput} onPointerLeave={clearInput}>STEER LEFT</button>
        <button type="button" onPointerDown={() => setInput({ steer: 1 })} onPointerUp={clearInput} onPointerLeave={clearInput}>STEER RIGHT</button>
        <button type="button" onPointerDown={() => setInput({ accelerate: true })} onPointerUp={clearInput} onPointerLeave={clearInput}>ACCELERATE</button>
        <button type="button" onPointerDown={() => setInput({ brake: true })} onPointerUp={clearInput} onPointerLeave={clearInput}>BRAKE</button>
      </div>

      <div className={styles.statusBar} aria-label="NIGHTSHIFT game status">
        <span>SPEED: {speedLabel(game.speedBand)}</span>
        <span>DIST: {Math.floor(game.distance)} M</span>
        <span>HULL: {Math.max(0, 2 - game.hits)}/2</span>
      </div>

      <p className={styles.help}>
        Arrow keys or W/A/S/D steer and change speed. Enter or Space starts, pauses, resumes, or restarts. The shift pauses when this PixelOS window is not active.
      </p>
    </section>
  )
}
