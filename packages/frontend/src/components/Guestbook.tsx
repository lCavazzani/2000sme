import { useCallback, useState, type FormEvent } from 'react'
import {
  guestbookErrorMessage,
  useCreateGuestbookEntry,
  useGuestbookEntries,
} from '../api/guestbook'
import { turnstileSiteKey } from '../config/turnstile'
import { TurnstileWidget } from './TurnstileWidget'
import styles from './Guestbook.module.css'

function formatEntryDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function Guestbook() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const guestbookQuery = useGuestbookEntries()
  const createEntry = useCreateGuestbookEntry()

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token)
    setSubmitError(null)
  }, [])

  const handleTurnstileFailure = useCallback((error: string) => {
    setTurnstileToken(null)
    setSubmitError(error)
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
    if (!turnstileSiteKey) {
      setSubmitError('Guestbook verification is not configured yet. Please try again later.')
      return
    }
    if (!turnstileToken) {
      setSubmitError('Complete the verification before signing the guestbook.')
      return
    }

    try {
      await createEntry.mutateAsync({ name: trimmedName, message: trimmedMessage, turnstileToken })
      setName('')
      setMessage('')
      setSuccessMessage('Thanks for signing the guestbook! Your entry is now visible.')
    } catch (error) {
      setSubmitError(guestbookErrorMessage(error))
    } finally {
      setTurnstileToken(null)
      setTurnstileResetKey((current) => current + 1)
    }
  }

  const entries = guestbookQuery.data?.entries ?? []
  const loadError = guestbookQuery.isError ? guestbookErrorMessage(guestbookQuery.error) : null
  const isSubmitting = createEntry.isPending
  const isLoading = guestbookQuery.isPending
  const turnstileConfigured = Boolean(turnstileSiteKey)

  return (
    <section className={styles.guestbook} aria-labelledby="guestbook-heading">
      <header className={styles.header}>
        <h2 id="guestbook-heading">Guestbook</h2>
        <p>Leave a note for the next visitor.</p>
      </header>

      <section className={styles.entries} aria-live="polite" aria-busy={isLoading || guestbookQuery.isFetching}>
        <h3>Recent entries</h3>
        {isLoading && (
          <p className={styles.loading} role="status">
            <span aria-hidden="true" className={styles.spinner} /> Loading guestbook entries…
          </p>
        )}
        {loadError && (
          <>
            <p className={styles.error} role="alert">{loadError}</p>
            <button type="button" onClick={() => void guestbookQuery.refetch()} disabled={guestbookQuery.isFetching}>
              Try again
            </button>
          </>
        )}
        {!isLoading && !loadError && entries.length === 0 && (
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
        {turnstileConfigured ? (
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            resetKey={turnstileResetKey}
            onToken={handleTurnstileToken}
            onFailure={handleTurnstileFailure}
          />
        ) : (
          <p className={styles.error} role="status">Guestbook verification is not configured yet.</p>
        )}
        <div className={styles.formFooter}>
          <small>{message.length}/280 characters</small>
          <button type="submit" disabled={isSubmitting || !turnstileConfigured || !turnstileToken}>
            {isSubmitting ? 'Signing…' : 'Sign Guestbook'}
          </button>
        </div>
        {submitError && <p className={styles.error} role="alert">{submitError}</p>}
        {successMessage && <p className={styles.success} role="status">{successMessage}</p>}
      </form>
    </section>
  )
}
