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
  kind: 'guide' | 'visitor' | 'system'
  text: string
  topic?: SignalTopic
}

type ToolAction = SignalTopic | 'wink' | 'attention'

const INITIAL_MESSAGES: readonly SignalMessage[] = [
  { id: 1, kind: 'guide', text: 'This local portfolio guide shares the work behind this PixelOS desktop.' },
  { id: 2, kind: 'guide', text: 'Use a tool, or ask about projects, experience, the resume, skills, or PixelOS.' },
]

const QUICK_TOOLS: readonly { topic: SignalTopic; label: string; icon: string }[] = [
  { topic: 'projects', label: 'PROJECTS', icon: PIXEL_OS_ASSETS.signalToolProjects },
  { topic: 'resume', label: 'RESUME', icon: PIXEL_OS_ASSETS.signalToolResume },
  { topic: 'about', label: 'ABOUT', icon: PIXEL_OS_ASSETS.signalToolAbout },
]

function messageLabel(kind: SignalMessage['kind']) {
  if (kind === 'guide') return 'LEONARDO'
  if (kind === 'visitor') return 'YOU'
  return 'LOCAL EVENT'
}

function ToolIcon({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" className={styles.toolIcon} />
}

export function SignalGuide() {
  const { openWindowById } = useWindows()
  const { effects } = useTheme()
  const [messages, setMessages] = useState<readonly SignalMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')
  const [announcement, setAnnouncement] = useState('LOCAL GUIDE READY')
  const [event, setEvent] = useState<'wink' | 'attention' | null>(null)
  const [winkReady, setWinkReady] = useState(true)
  const [attentionReady, setAttentionReady] = useState(true)
  const [portraitError, setPortraitError] = useState(false)
  const quickPromptRef = useRef<HTMLButtonElement>(null)
  const nextIdRef = useRef(3)
  const fullEffects = effects === 'full'
  const animatedPortrait = fullEffects && !portraitError
    ? PIXEL_OS_ASSETS.leonardoSignalSmartBlinkGif
    : PIXEL_OS_ASSETS.leonardoSignalStatic

  useEffect(() => {
    quickPromptRef.current?.focus()
  }, [])

  const appendTopic = (topic: SignalTopic, visitorText = visitorPromptForTopic(topic)) => {
    const reply = SIGNAL_GUIDE_REPLIES[topic]
    const visitor: SignalMessage = { id: nextIdRef.current++, kind: 'visitor', text: visitorText, topic }
    const guide: SignalMessage = { id: nextIdRef.current++, kind: 'guide', text: reply.text, topic }
    setMessages((current) => [...current, visitor, guide])
    setAnnouncement(reply.text)
  }

  const submitDraft = () => {
    const text = draft.trim()
    if (!text) return
    appendTopic(signalTopicFromInput(text), text)
    setDraft('')
  }

  const appendEvent = (kind: Extract<ToolAction, 'wink' | 'attention'>, text: string) => {
    setEvent(kind)
    setMessages((current) => [...current, { id: nextIdRef.current++, kind: 'system', text }])
    setAnnouncement(text)
  }

  const triggerWink = () => {
    if (!winkReady) return
    setWinkReady(false)
    appendEvent('wink', 'LOCAL WINK MARKED. NO MESSAGE WAS SENT.')
    window.setTimeout(() => setWinkReady(true), 2_000)
  }

  const triggerAttention = () => {
    if (!attentionReady) return
    setAttentionReady(false)
    appendEvent(
      'attention',
      effects === 'reduced'
        ? 'ATTENTION MARKED LOCALLY. EFFECTS ARE REDUCED.'
        : 'ATTENTION MARKED LOCALLY.',
    )
    window.setTimeout(() => setAttentionReady(true), 3_000)
  }

  return (
    <section className={styles.root} aria-labelledby="signal-heading" data-event={event ?? undefined}>
      <div className={styles.sessionRibbon} aria-label="Local session">LEONARDO · PORTFOLIO GUIDE · ONE LOCAL CONVERSATION</div>

      <header className={styles.ownerHeader}>
        <img src={PIXEL_OS_ASSETS.leonardoProfile64} alt="" aria-hidden="true" className={styles.headerPortrait} />
        <div>
          <h2 id="signal-heading">LEONARDO CAVAZZANI</h2>
          <p>SENIOR FRONTEND DEVELOPER · LOCAL PORTFOLIO GUIDE</p>
          <p>ASK ABOUT PROJECTS, EXPERIENCE, OR SKILLS.</p>
        </div>
      </header>

      <output className={styles.liveStatus} aria-live="polite">{announcement}</output>

      <div className={styles.toolRow} aria-label="Leonardo local guide tools">
        <div className={styles.actionStrip}>
          {QUICK_TOOLS.map((tool, index) => (
            <button
              key={tool.topic}
              type="button"
              ref={index === 0 ? quickPromptRef : undefined}
              onClick={() => appendTopic(tool.topic)}
            >
              <ToolIcon src={tool.icon} />
              <span>{tool.label}</span>
            </button>
          ))}
          <button type="button" onClick={triggerWink} disabled={!winkReady}>
            <ToolIcon src={PIXEL_OS_ASSETS.signalToolWink} />
            <span>WINK</span>
          </button>
          <button type="button" onClick={triggerAttention} disabled={!attentionReady}>
            <ToolIcon src={PIXEL_OS_ASSETS.signalToolAttention} />
            <span>ATTENTION</span>
          </button>
        </div>
        <p className={styles.localContract}>LOCAL ONLY · NO NETWORK · NO STORAGE</p>
      </div>

      <div className={styles.conversationLayout}>
        <section className={styles.conversationCanvas} aria-label="Leonardo portfolio guide reading canvas">
          <p className={styles.eventStrip}>LEONARDO&apos;S LOCAL PORTFOLIO GUIDE · REPLIES STAY ON THIS DEVICE</p>
          <ol className={styles.transcript} aria-label="Leonardo local portfolio guide conversation">
            {messages.map((message) => {
              const reply = message.topic ? SIGNAL_GUIDE_REPLIES[message.topic] : undefined
              return (
                <li key={message.id} className={styles[message.kind]}>
                  <span className={styles.messageLabel}>{messageLabel(message.kind)}</span>
                  <p>{message.text}</p>
                  {message.kind === 'guide' && reply?.action && (
                    <button type="button" onClick={() => openWindowById(reply.action!.applicationId)}>
                      <ToolIcon src={PIXEL_OS_ASSETS.signalToolOpenApp} />
                      <span>{reply.action.label}</span>
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <aside className={styles.ownerRail} aria-label="Leonardo local portfolio guide profile">
          <picture>
            <source media="(max-width: 760px)" srcSet={PIXEL_OS_ASSETS.leonardoSignalStatic} />
            <img
              src={animatedPortrait}
              alt=""
              aria-hidden="true"
              className={styles.ownerPortrait}
              onError={() => setPortraitError(true)}
            />
          </picture>
          <div className={styles.ownerRailCopy}>
            <p>LEONARDO CAVAZZANI</p>
            <p>SENIOR FRONTEND DEVELOPER</p>
            <p>LOCAL PORTFOLIO GUIDE</p>
            <span>OWNER CONTEXT</span>
          </div>
        </aside>
      </div>

      <form className={styles.composer} onSubmit={(formEvent) => { formEvent.preventDefault(); submitDraft() }}>
        <label htmlFor="signal-local-question">MESSAGE THE LOCAL PORTFOLIO GUIDE</label>
        <div>
          <input
            id="signal-local-question"
            value={draft}
            onChange={(inputEvent) => setDraft(inputEvent.target.value)}
            placeholder="Ask about the work…"
            autoComplete="off"
          />
          <button type="submit" disabled={!draft.trim()}>
            <ToolIcon src={PIXEL_OS_ASSETS.signalToolSend} />
            <span>SEND LOCAL</span>
          </button>
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
