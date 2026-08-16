/**
 * This is intentionally public browser configuration. Turnstile site keys are
 * designed to be embedded in the page; only the matching secret belongs in the
 * backend Worker secret store.
 */
export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''
