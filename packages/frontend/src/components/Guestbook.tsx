import { useEffect, useState, type FormEvent } from 'react'
import { guestbookApiUrl } from '../config/api'
import styles from './Guestbook.module.css'

type GuestbookEntry = {
  id: number
  name: string
  message: string
  created_at: string
}

type RequestState = 'idle' | 'loading' | 'submitting'

function requestErrorMessage(response: Response, fallback: string) {
  if (response.status >= 500) return 'The guestbook service is unavailable. Please try again later.'
  return fallback
}

function formatEntryDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [requestState, setRequestState] = useState<RequestState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadEntries() {
      setRequestState('loading')
      setLoadError(null)

      try {
        const response = await fetch(guestbookApiUrl, { signal: controller.signal })
        if (!response.ok) throw new Error(requestErrorMessage(response, 'Could not load guestbook entries.'))

        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) throw new Error('The guestbook service returned an invalid response.')

        if (active) setEntries(payload as GuestbookEntry[])
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === 'AbortError')) {
          setLoadError(error instanceof Error ? error.message : 'Could not load guestbook entries.')
        }
      } finally {
        if (active) setRequestState('idle')
      }
    }

    void loadEntries()
    return () => {
      active = false
      controller.abort()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    setSubmitError(null)
    setSuccessMessage(null)

    if (!trimmedName || !trimmedMessage) {
      setSubmitError('Enter both your name and a guestbook message.')
      return
    }

    setRequestState('submitting')
    try {
      const response = await fetch(guestbookApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      })

      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok || !payload || typeof payload !== 'object') {
        const apiMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : requestErrorMessage(response, 'Could not save your guestbook entry.')
        throw new Error(apiMessage)
      }

      const entry = payload as GuestbookEntry
      setEntries((currentEntries) => [entry, ...currentEntries])
      setName('')
      setMessage('')
      setSuccessMessage('Thanks for signing the guestbook! Your entry is now visible.')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save your guestbook entry.')
    } finally {
      setRequestState('idle')
    }
  }

  const isSubmitting = requestState === 'submitting'

  return (
    <section className={styles.guestbook} aria-labelledby="guestbook-heading">
      <header className={styles.header}>
        <h2 id="guestbook-heading">Guestbook</h2>
        <p>Leave a note for the next visitor.</p>
      </header>

      <section className={styles.entries} aria-live="polite" aria-busy={requestState === 'loading'}>
        <h3>Recent entries</h3>
        {requestState === 'loading' && (
          <p className={styles.loading} role="status">
            <span aria-hidden="true" className={styles.spinner} /> Loading guestbook entries…
          </p>
        )}
        {loadError && <p className={styles.error} role="alert">{loadError}</p>}
        {requestState !== 'loading' && !loadError && entries.length === 0 && (
          <p className={styles.empty}>No entries yet. Be the first to sign the guestbook.</p>
        )}
        {entries.length > 0 && (
          <ol className={styles.entryList}>
            {entries.map((entry) => (
              <li className={styles.entry} key={entry.id}>
                <header>
                  <strong>{entry.name}</strong>
                  <time dateTime={entry.created_at}>{formatEntryDate(entry.created_at)}</time>
                </header>
                <p>{entry.message}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>Sign the guestbook</h3>
        <label htmlFor="guestbook-name">Name</label>
        <input
          id="guestbook-name"
          name="name"
          maxLength={50}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <label htmlFor="guestbook-message">Message</label>
        <textarea
          id="guestbook-message"
          name="message"
          maxLength={280}
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <div className={styles.formFooter}>
          <small>{message.length}/280 characters</small>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing…' : 'Sign Guestbook'}
          </button>
        </div>
        {submitError && <p className={styles.error} role="alert">{submitError}</p>}
        {successMessage && <p className={styles.success} role="status">{successMessage}</p>}
      </form>
    </section>
  )
}
