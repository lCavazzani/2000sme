export const NIGHTSHIFT_LOCAL_STATE_KEY = '2000sme:nightshift:v1'

export type NightshiftLocalState = {
  bestDistance: number
  showGuide: boolean
}

export const DEFAULT_NIGHTSHIFT_LOCAL_STATE: NightshiftLocalState = {
  bestDistance: 0,
  showGuide: true,
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function readNightshiftLocalState(): NightshiftLocalState {
  if (typeof window === 'undefined') return DEFAULT_NIGHTSHIFT_LOCAL_STATE

  try {
    const raw = window.localStorage.getItem(NIGHTSHIFT_LOCAL_STATE_KEY)
    if (!raw) return DEFAULT_NIGHTSHIFT_LOCAL_STATE

    const parsed = JSON.parse(raw) as Partial<NightshiftLocalState>
    if (!isFiniteNonNegative(parsed.bestDistance) || typeof parsed.showGuide !== 'boolean') {
      return DEFAULT_NIGHTSHIFT_LOCAL_STATE
    }

    return {
      bestDistance: Math.floor(parsed.bestDistance),
      showGuide: parsed.showGuide,
    }
  } catch {
    return DEFAULT_NIGHTSHIFT_LOCAL_STATE
  }
}

export function writeNightshiftLocalState(state: NightshiftLocalState): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(NIGHTSHIFT_LOCAL_STATE_KEY, JSON.stringify({
      bestDistance: Math.max(0, Math.floor(state.bestDistance)),
      showGuide: state.showGuide,
    }))
  } catch {
    // Private browsing, storage quotas, and browser policy must not block local play.
  }
}
