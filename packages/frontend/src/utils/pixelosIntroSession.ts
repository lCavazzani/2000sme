const INTRO_SEEN_STORAGE_KEY = '2000sme:pixelos-intro-seen:v1'

export function hasSeenPixelOsIntro() {
  if (typeof window === 'undefined') return false

  try {
    return window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function markPixelOsIntroSeen() {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, 'true')
  } catch {
    // Storage is optional; the current in-memory desktop entry remains available.
  }
}
