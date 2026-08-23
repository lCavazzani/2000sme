import { useEffect, useRef, useState } from 'react'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
import { useWindows } from '../../store/windows'
import { useTheme } from '../../theme/ThemeProvider'
import {
  SIGNAL_GUIDE_REPLIES,
  signalTopicFromInput,
  type SignalTopic,
  visitorPromptForTopic,
} from './signalGuideContent'
import styles from './SignalGuide.module.css'

type SignalMessage = {
  id: number
  kind: 'mittens' | 'visitor' | 'system'
  text: string
  topic?: SignalTopic
}

const INITIAL_MESSAGES: readonly SignalMessage[] = [
  { id: 1, kind: 'mittens', text: 'Hi, I am Mittens.' },
  { id: 2, kind: 'mittens', text: 'Ask about Leonardo, projects, the resume, or PixelOS.' },
]

const QUICK_TOPICS: readonly SignalTopic[] = ['projects', 'resume', 'about']

function labelForTopic(topic: SignalTopic): string {
  return topic.toUpperCase()
}

export function SignalGuide() {
  const { openWindowById } = useWindows()
  const { effects } = useTheme()
  const [messages, setMessages] = useState<readonly SignalMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')
  const [announcement, setAnnouncement] = useState('GUIDE READY')
  const [event, setEvent] = useState<'wink' | 'attention' | null>(null)
  const [winkReady, setWinkReady] = useState(true)
  const [attentionReady, setAttentionReady] = useState(true)
  const quickPromptRef = useRef<HTMLButtonElement>(null)
  const nextIdRef = useRef(3)

  useEffect(() => {
    quickPromptRef.current?.focus()
  }, [])

  const appendTopic = (topic: SignalTopic, visitorText = visitorPromptForTopic(topic)) => {
    const reply = SIGNAL_GUIDE_REPLIES[topic]
    const visitor: SignalMessage = { id: nextIdRef.current++, kind: 'visitor', text: visitorText, topic }
    const mittens: SignalMessage = { id: nextIdRef.current++, kind: 'mittens', text: reply.text, topic }
    setMessages((current) => [...current, visitor, mittens])
    setAnnouncement(reply.text)
  }

  const submitDraft = () => {
    const text = draft.trim()
    if (!text) return
    const topic = signalTopicFromInput(text)
    appendTopic(topic, text)
    setDraft('')
  }

  const triggerWink = () => {
    if (!winkReady) return
    setWinkReady(false)
    setEvent('wink')
    setMessages((current) => [...current, { id: nextIdRef.current++, kind: 'system', text: 'MITTENS SENT A LOCAL WINK.' }])
    setAnnouncement('Mittens sent a local wink.')
    window.setTimeout(() => setWinkReady(true), 2_000)
  }

  const triggerAttention = () => {
    if (!attentionReady) return
    setAttentionReady(false)
    setEvent('attention')
    const text = effects === 'reduced'
      ? 'ATTENTION MARKED LOCALLY. EFFECTS ARE REDUCED.'
      : 'ATTENTION MARKED LOCALLY.'
    setMessages((current) => [...current, { id: nextIdRef.current++, kind: 'system', text }])
    setAnnouncement(text)
    window.setTimeout(() => setAttentionReady(true), 3_000)
  }

  return (
    <section className={styles.root} aria-labelledby="signal-heading">
      <header className={styles.header} data-attention={event === 'attention' && effects === 'full'} tabIndex={-1}>
        <img src={PIXEL_OS_ASSETS.mittens} alt="" className={styles.avatar} />
        <div>
          <h2 id="signal-heading">MITTENS</h2>
          <p>PIXEL OS GUIDE · LOCAL</p>
          <p className={styles.ready}><span aria-hidden="true">●</span> GUIDE READY</p>
        </div>
      </header>

      <p className={styles.localContract}>ONE LOCAL CONVERSATION. TYPED TEXT IS NEVER SENT, STORED, OR ANALYZED.</p>
      <output className={styles.liveStatus} aria-live="polite">{announcement}</output>

      <ol className={styles.transcript} aria-label="Mittens local guide conversation">
        {messages.map((message) => {
          const reply = message.topic ? SIGNAL_GUIDE_REPLIES[message.topic] : undefined
          return (
            <li key={message.id} className={styles[message.kind]}>
              <span className={styles.messageLabel}>{message.kind === 'mittens' ? 'MITTENS' : message.kind === 'visitor' ? 'YOU' : 'LOCAL EVENT'}</span>
              <p>{message.text}</p>
              {message.kind === 'mittens' && reply?.action && (
                <button type="button" onClick={() => openWindowById(reply.action!.applicationId)}>{reply.action.label}</button>
              )}
            </li>
          )
        })}
      </ol>

      <div className={styles.actionStrip} aria-label="Mittens quick prompts and local actions">
        {QUICK_TOPICS.map((topic, index) => (
          <button
            key={topic}
            type="button"
            ref={index === 0 ? quickPromptRef : undefined}
            onClick={() => appendTopic(topic)}
          >
            {labelForTopic(topic)}
          </button>
        ))}
        <button type="button" onClick={triggerWink} disabled={!winkReady}>WINK</button>
        <button type="button" onClick={triggerAttention} disabled={!attentionReady}>ATTENTION</button>
      </div>

      <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); submitDraft() }}>
        <label htmlFor="signal-local-question">ASK THE LOCAL GUIDE</label>
        <div>
          <input
            id="signal-local-question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask Mittens locally…"
            autoComplete="off"
          />
          <button type="submit" disabled={!draft.trim()}>SEND LOCAL</button>
        </div>
      </form>

      <div className="status-bar" aria-label="SIGNAL local privacy status">
        <p className="status-bar-field">LOCAL GUIDE</p>
        <p className="status-bar-field">NO NETWORK</p>
        <p className="status-bar-field">NO HISTORY</p>
      </div>
    </section>
  )
}
