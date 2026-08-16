import { useEffect, useRef, useState } from 'react'

type TurnstileApi = {
  ready: (callback: () => void) => void
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      action: string
      theme: 'auto'
      size: 'flexible'
      callback: (token: string) => void
      'error-callback': () => void
      'expired-callback': () => void
      'timeout-callback': () => void
    },
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-api'
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let turnstileScriptPromise: Promise<TurnstileApi> | undefined

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null
    const onLoad = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile did not initialize.'))
    }

    if (script) {
      script.addEventListener('load', onLoad, { once: true })
      script.addEventListener('error', () => reject(new Error('Turnstile failed to load.')), { once: true })
      return
    }

    const newScript = document.createElement('script')
    newScript.id = TURNSTILE_SCRIPT_ID
    newScript.src = TURNSTILE_SCRIPT_URL
    newScript.async = true
    newScript.defer = true
    newScript.addEventListener('load', onLoad, { once: true })
    newScript.addEventListener('error', () => reject(new Error('Turnstile failed to load.')), { once: true })
    document.head.append(newScript)
  })

  return turnstileScriptPromise
}

type TurnstileWidgetProps = {
  siteKey: string
  resetKey: number
  onToken: (token: string) => void
  onFailure: (message: string) => void
}

export function TurnstileWidget({ siteKey, resetKey, onToken, onFailure }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    let active = true
    let widgetId: string | undefined

    setState('loading')
    void loadTurnstileScript()
      .then((turnstile) => {
        if (!active || !containerRef.current) return

        turnstile.ready(() => {
          if (!active || !containerRef.current) return
          widgetId = turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action: 'guestbook',
            theme: 'auto',
            size: 'flexible',
            callback: (token) => {
              if (!active) return
              setState('ready')
              onToken(token)
            },
            'error-callback': () => {
              if (!active) return
              setState('failed')
              onFailure('Verification could not load. Check your connection and try again.')
            },
            'expired-callback': () => {
              if (!active) return
              onFailure('Verification expired. Please complete it again.')
            },
            'timeout-callback': () => {
              if (!active) return
              onFailure('Verification timed out. Please complete it again.')
            },
          })
          setState('ready')
        })
      })
      .catch(() => {
        if (!active) return
        setState('failed')
        onFailure('Verification could not load. Check your connection and try again.')
      })

    return () => {
      active = false
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [onFailure, onToken, resetKey, siteKey])

  return (
    <div aria-live="polite" aria-busy={state === 'loading'}>
      <div ref={containerRef} />
      {state === 'loading' && <p role="status">Loading verification…</p>}
    </div>
  )
}
