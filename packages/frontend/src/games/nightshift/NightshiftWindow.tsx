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

  const primaryLabel = game.status === 'ready'
    ? 'START SHIFT'
    : game.status === 'paused'
      ? 'RESUME'
      : 'SHIFT RUNNING'
  const canPause = game.status === 'playing' || game.status === 'paused'

  const stateMessage = game.status === 'ready'
    ? 'READY: START A LOCAL SHIFT.'
    : game.status === 'playing'
      ? 'RUNNING: ROAD AHEAD.'
      : game.status === 'paused'
        ? 'PAUSED: PRESS RESUME WHEN READY.'
        : `SIGNAL LOST: ${distanceLabel(game.distance)}. RESET IS AVAILABLE.`

  return (
    <section className={styles.window} aria-labelledby="nightshift-heading">
      <header className={styles.header}>
        <h2 id="nightshift-heading" className={styles.title}>NIGHTSHIFT.EXE</h2>
        <output className={styles.status} aria-live="polite">{statusLabel(game.status)}</output>
      </header>

      <p className={styles.stateMessage} role="status">{stateMessage}</p>

      <dl className={styles.hud} aria-label="NIGHTSHIFT dashboard">
        <div><dt>DIST</dt><dd>{distanceLabel(game.distance)}</dd></div>
        <div><dt>BEST</dt><dd>{distanceLabel(bestDistance)}</dd></div>
        <div><dt>SPEED</dt><dd>{speedLabel(game.speedBand)}</dd></div>
        <div><dt>HULL</dt><dd>{Math.max(0, 2 - game.hits)}/2</dd></div>
      </dl>

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

      <div className={styles.actionRail} aria-label="NIGHTSHIFT shift actions">
        <button
          type="button"
          className={styles.primaryAction}
          onClick={toggleRun}
          disabled={!active || game.status === 'game-over' || game.status === 'playing'}
        >
          {primaryLabel}
        </button>
        <button type="button" className={styles.pauseAction} onClick={pauseOrResume} disabled={!canPause}>
          {game.status === 'paused' ? 'RESUME' : 'PAUSE'}
        </button>
        <button type="button" className={styles.resetAction} onClick={restartAfterGameOver} disabled={game.status !== 'game-over'}>
          RESET
        </button>
      </div>

      <p className={styles.keyboardLegend}>
        <strong>KEYBOARD:</strong> A / ← and D / → steer. W / ↑ goes faster. S / ↓ brakes. P or Esc pauses. R resets after game over.
      </p>

      <div className={styles.touchDeck} aria-label="NIGHTSHIFT touch controls">
        <section className={styles.touchCard} aria-label="Steer controls">
          <span>STEER</span>
          <div>
            <button type="button" onClick={() => tapInput({ steer: -1 })} aria-label="Steer left">←</button>
            <button type="button" onClick={() => tapInput({ steer: 1 })} aria-label="Steer right">→</button>
          </div>
        </section>
        <section className={styles.touchCard} aria-label="Pace controls">
          <span>PACE</span>
          <div>
            <button type="button" onClick={() => tapInput({ accelerate: true })}>GO</button>
            <button type="button" onClick={() => tapInput({ brake: true })}>BRAKE</button>
          </div>
        </section>
      </div>

      {game.hits > 0 && (
        <p className={styles.impact} data-game-over={game.status === 'game-over'}>
          {game.status === 'game-over' ? 'HULL LOST: SIGNAL ENDED.' : 'HULL IMPACT: SHIFT PAUSED.'}
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
          Canvas focus: Arrow keys or A/D steer; W/Up accelerates; S/Down brakes; P or Escape pauses; R resets only after HULL LOST. All controls are local and no score is sent anywhere.
        </p>
      )}
    </section>
  )
}
