import { useCallback } from 'react'
import { NightshiftCanvas } from './NightshiftCanvas'
import { speedLabel, statusLabel } from './types'
import { useNightshiftGame } from './useNightshiftGame'
import styles from './NightshiftWindow.module.css'

function distanceLabel(distance: number): string {
  return `${Math.floor(distance)} M`
}

export function NightshiftWindow() {
  const {
    active,
    game,
    bestDistance,
    showGuide,
    toggleGuide,
    start,
    pause,
    resume,
    restart,
    tapInput,
    clearInput,
  } = useNightshiftGame()

  const toggleRun = useCallback(() => {
    if (game.status === 'ready') start()
    else if (game.status === 'playing') pause()
    else if (game.status === 'paused') resume()
  }, [game.status, pause, resume, start])

  const pauseOrResume = useCallback(() => {
    if (game.status === 'playing') pause()
    else if (game.status === 'paused') resume()
  }, [game.status, pause, resume])

  const restartAfterGameOver = useCallback(() => {
    if (game.status === 'game-over') restart()
  }, [game.status, restart])

  const runLabel = game.status === 'ready'
    ? 'START SHIFT'
    : game.status === 'playing'
      ? 'PAUSE'
      : game.status === 'paused'
        ? 'RESUME'
        : 'SHIFT ENDED'

  const stateMessage = game.status === 'ready'
    ? 'READY: START A LOCAL SHIFT.'
    : game.status === 'playing'
      ? 'RUNNING: ROAD AHEAD.'
      : game.status === 'paused'
        ? 'PAUSED: PRESS RESUME WHEN READY.'
        : `SIGNAL LOST: ${distanceLabel(game.distance)}. RESTART IS AVAILABLE.`

  return (
    <section className={styles.window} aria-labelledby="nightshift-heading">
      <header className={styles.header}>
        <h2 id="nightshift-heading" className={styles.title}>NIGHTSHIFT.EXE</h2>
        <output className={styles.status} aria-live="polite">{statusLabel(game.status)}</output>
      </header>

      <p className={styles.stateMessage} role="status">{stateMessage}</p>

      <div className={styles.stage}>
        <NightshiftCanvas
          game={game}
          tapInput={tapInput}
          clearInput={clearInput}
          onToggleRun={toggleRun}
          onPauseResume={pauseOrResume}
          onRestart={restartAfterGameOver}
        />
      </div>

      <div className={styles.controls} aria-label="NIGHTSHIFT local controls">
        <button type="button" onClick={toggleRun} disabled={!active || game.status === 'game-over'}>{runLabel}</button>
        <button type="button" onClick={restartAfterGameOver} disabled={game.status !== 'game-over'}>RESTART</button>
        <button type="button" onClick={() => tapInput({ steer: -1 })}>LEFT</button>
        <button type="button" onClick={() => tapInput({ steer: 1 })}>RIGHT</button>
        <button type="button" onClick={() => tapInput({ accelerate: true })}>GO</button>
        <button type="button" onClick={() => tapInput({ brake: true })}>BRAKE</button>
        <button type="button" onClick={pauseOrResume} disabled={game.status !== 'playing' && game.status !== 'paused'}>PAUSE / RESUME</button>
      </div>

      <dl className={styles.hud} aria-label="NIGHTSHIFT HUD">
        <div><dt>DIST</dt><dd>{distanceLabel(game.distance)}</dd></div>
        <div><dt>BEST</dt><dd>{distanceLabel(bestDistance)}</dd></div>
        <div><dt>SPEED</dt><dd>{speedLabel(game.speedBand)}</dd></div>
        <div><dt>PAUSE</dt><dd>{game.status === 'paused' ? 'ON' : 'OFF'}</dd></div>
        <div><dt>HULL</dt><dd>{Math.max(0, 2 - game.hits)}/2</dd></div>
      </dl>

      {game.hits > 0 && (
        <p className={styles.impact} data-game-over={game.status === 'game-over'}>
          {game.status === 'game-over' ? 'STATIC IMPACT: SIGNAL LOST.' : 'IMPACT REGISTERED: SHIFT PAUSED.'}
        </p>
      )}

      <div className={styles.guideRow}>
        <button type="button" onClick={toggleGuide} aria-pressed={showGuide}>
          {showGuide ? 'HIDE LOCAL GUIDE' : 'SHOW LOCAL GUIDE'}
        </button>
        <span>LOCAL SETTINGS ONLY</span>
      </div>

      {showGuide && (
        <p className={styles.help}>
          Canvas focus: Arrow keys or A/D steer; W/Up accelerates; S/Down brakes; P or Escape pauses; R restarts only after SIGNAL LOST. All controls are local and no score is sent anywhere.
        </p>
      )}
    </section>
  )
}
