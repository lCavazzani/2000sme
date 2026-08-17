import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import {
  guestbookErrorMessage,
  useCreateGuestbookEntry,
  useGuestbookEntries,
} from '../api/guestbook'
import { turnstileSiteKey } from '../config/turnstile'
import { TurnstileWidget } from './TurnstileWidget'
import styles from './Guestbook.module.css'

type ScrapbookPane = 'notes' | 'compose'
type FieldErrors = { name?: string; message?: string }

const MAX_NAME_LENGTH = 50
const MAX_MESSAGE_LENGTH = 280

function formatEntryDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function validateEntry(name: string, message: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!name.trim()) errors.name = 'Enter your name before leaving a note.'
  if (!message.trim()) errors.message = 'Write a note before signing the scrapbook.'
  return errors
}

export function Guestbook() {
  const [activePane, setActivePane] = useState<ScrapbookPane>('notes')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const notesHeadingRef = useRef<HTMLHeadingElement>(null)
  const guestbookQuery = useGuestbookEntries()
  const createEntry = useCreateGuestbookEntry()

  const turnstileConfigured = Boolean(turnstileSiteKey)
  const entries = guestbookQuery.data?.entries ?? []
  const loadError = guestbookQuery.isError ? guestbookErrorMessage(guestbookQuery.error) : null
  const isSubmitting = createEntry.isPending
  const isLoading = guestbookQuery.isPending

  useEffect(() => {
    if (activePane === 'compose') nameInputRef.current?.focus()
  }, [activePane])

  const selectPane = useCallback((pane: ScrapbookPane) => {
    setActivePane(pane)
    setSubmitError(null)
  }, [])

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
    const nextErrors = validateEntry(trimmedName, trimmedMessage)

    setFieldErrors(nextErrors)
    setSubmitError(null)
    setSuccessMessage(null)

    if (Object.keys(nextErrors).length > 0) return
    if (!turnstileConfigured) {
      setSubmitError('Visitor verification is not configured yet. Please try again later.')
      return
    }
    if (!turnstileToken) {
      setSubmitError('Complete visitor verification before leaving your note.')
      return
    }

    try {
      await createEntry.mutateAsync({ name: trimmedName, message: trimmedMessage, turnstileToken })
      setName('')
      setMessage('')
      setFieldErrors({})
      setSuccessMessage('Thanks for leaving a note. It is now visible in the Visitor Scrapbook.')
      setActivePane('notes')
      window.requestAnimationFrame(() => notesHeadingRef.current?.focus())
    } catch (error) {
      setSubmitError(guestbookErrorMessage(error))
    } finally {
      setTurnstileToken(null)
      setTurnstileResetKey((current) => current + 1)
    }
  }

  return (
    <section className={styles.scrapbook} aria-labelledby="scrapbook-heading">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Visitor log</p>
        <h2 id="scrapbook-heading">Notes from visitors</h2>
        <p>Read notes from past visitors or leave a thoughtful note for the next one.</p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Visitor Scrapbook sections">
        <button
          id="scrapbook-notes-tab"
          type="button"
          role="tab"
          aria-selected={activePane === 'notes'}
          aria-controls="scrapbook-notes-panel"
          tabIndex={activePane === 'notes' ? 0 : -1}
          onClick={() => selectPane('notes')}
        >
          Read notes
        </button>
        <button
          id="scrapbook-compose-tab"
          type="button"
          role="tab"
          aria-selected={activePane === 'compose'}
          aria-controls="scrapbook-compose-panel"
          tabIndex={activePane === 'compose' ? 0 : -1}
          onClick={() => selectPane('compose')}
        >
          Leave a note
        </button>
      </div>

      <section
        id="scrapbook-notes-panel"
        className={styles.panel}
        role="tabpanel"
        aria-labelledby="scrapbook-notes-tab"
        hidden={activePane !== 'notes'}
      >
        <div className={styles.panelHeader}>
          <div>
            <h2 ref={notesHeadingRef} tabIndex={-1}>Recent notes</h2>
            <p>Newest notes appear first.</p>
          </div>
          <button type="button" className={styles.secondaryAction} onClick={() => selectPane('compose')}>
            Leave a note
          </button>
        </div>

        <div className={styles.feed} aria-live="polite" aria-busy={isLoading || guestbookQuery.isFetching}>
          {successMessage && <p className={styles.success} role="status">{successMessage}</p>}
          {isLoading && <p className={styles.loading} role="status">Loading visitor notes…</p>}
          {loadError && (
            <div className={styles.errorPanel} role="alert">
              <p>{loadError}</p>
              <button type="button" className={styles.secondaryAction} onClick={() => void guestbookQuery.refetch()} disabled={guestbookQuery.isFetching}>
                {guestbookQuery.isFetching ? 'Retrying…' : 'Try again'}
              </button>
            </div>
          )}
          {!isLoading && !loadError && entries.length === 0 && (
            <div className={styles.empty}>
              <h3>No notes yet</h3>
              <p>Be the first visitor to add a page to this scrapbook.</p>
              <button type="button" className={styles.secondaryAction} onClick={() => selectPane('compose')}>
                Leave the first note
              </button>
            </div>
          )}
          {!isLoading && !loadError && entries.length > 0 && (
            <ol className={styles.entryList} aria-label="Visitor notes in chronological order">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <article className={styles.entry} aria-labelledby={`scrapbook-note-${entry.id}`}>
                    <header>
                      <h3 id={`scrapbook-note-${entry.id}`}>{entry.name}</h3>
                      <time dateTime={entry.created_at}>{formatEntryDate(entry.created_at)}</time>
                    </header>
                    <p>{entry.message}</p>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section
        id="scrapbook-compose-panel"
        className={styles.panel}
        role="tabpanel"
        aria-labelledby="scrapbook-compose-tab"
        hidden={activePane !== 'compose'}
      >
        <div className={styles.panelHeader}>
          <div>
            <h2>Leave a note</h2>
            <p>Your note appears after visitor verification succeeds.</p>
          </div>
          <button type="button" className={styles.secondaryAction} onClick={() => selectPane('notes')}>
            Read notes
          </button>
        </div>

        <form className={styles.composer} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="guestbook-name">Your name</label>
            <input
              ref={nameInputRef}
              id="guestbook-name"
              name="name"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setFieldErrors((current) => ({ ...current, name: undefined }))
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'guestbook-name-error' : 'guestbook-name-help'}
            />
            <small id="guestbook-name-help">Use the name you would like shown beside your note.</small>
            {fieldErrors.name && <p id="guestbook-name-error" className={styles.fieldError}>{fieldErrors.name}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="guestbook-message">Your note</label>
            <textarea
              id="guestbook-message"
              name="message"
              maxLength={MAX_MESSAGE_LENGTH}
              rows={5}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setFieldErrors((current) => ({ ...current, message: undefined }))
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? 'guestbook-message-error guestbook-message-count' : 'guestbook-message-count'}
            />
            <div className={styles.fieldMeta}>
              <small id="guestbook-message-count" aria-live="polite">{message.length}/{MAX_MESSAGE_LENGTH} characters</small>
              <small>Keep it kind and concise.</small>
            </div>
            {fieldErrors.message && <p id="guestbook-message-error" className={styles.fieldError}>{fieldErrors.message}</p>}
          </div>

          {turnstileConfigured ? (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              resetKey={turnstileResetKey}
              onToken={handleTurnstileToken}
              onFailure={handleTurnstileFailure}
            />
          ) : (
            <p className={styles.errorPanel} role="status">Visitor verification is not configured yet.</p>
          )}

          <div className={styles.composerFooter}>
            <button type="submit" className={styles.primaryAction} disabled={isSubmitting || !turnstileConfigured || !turnstileToken}>
              {isSubmitting ? 'Saving your note…' : 'Add note to scrapbook'}
            </button>
            <p>Submitting is disabled until visitor verification is complete.</p>
          </div>
          {submitError && <p className={styles.errorPanel} role="alert">{submitError}</p>}
        </form>
      </section>
    </section>
  )
}
