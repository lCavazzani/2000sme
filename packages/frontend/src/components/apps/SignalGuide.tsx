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
  kind: 'guide' | 'visitor'
  text: string
  topic?: SignalTopic
}

const INITIAL_MESSAGES: readonly SignalMessage[] = [
  { id: 1, kind: 'guide', text: 'This local portfolio guide shares the work behind this PixelOS desktop.' },
  { id: 2, kind: 'guide', text: 'Use a tool at right, or ask about projects, experience, the resume, skills, or PixelOS.' },
]

const OWNER_RAIL_TOOLS: readonly { topic: SignalTopic; label: string; icon: string }[] = [
  { topic: 'projects', label: 'PROJECTS', icon: PIXEL_OS_ASSETS.signalToolProjects },
  { topic: 'resume', label: 'RESUME', icon: PIXEL_OS_ASSETS.signalToolResume },
  { topic: 'about', label: 'ABOUT', icon: PIXEL_OS_ASSETS.signalToolAbout },
]

function messageLabel(kind: SignalMessage['kind']) {
  return kind === 'guide' ? 'LEONARDO' : 'YOU'
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
  const [portraitError, setPortraitError] = useState(false)
  const quickPromptRef = useRef<HTMLButtonElement>(null)
  const nextIdRef = useRef(3)
  const animatedPortrait = effects === 'full' && !portraitError
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

  return (
    <section className={styles.root} aria-labelledby="signal-heading">
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
            <p>SENIOR SOFTWARE DEVELOPER</p>
            <p>PORTFOLIO GUIDE</p>
          </div>
          <div className={styles.ownerRailTools} aria-label="Leonardo local guide tools">
            {OWNER_RAIL_TOOLS.map((tool, index) => (
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
          </div>
        </aside>
      </div>

      <form className={styles.composer} onSubmit={(formEvent) => { formEvent.preventDefault(); submitDraft() }}>
        <label htmlFor="signal-local-question">MESSAGE THE LOCAL PORTFOLIO GUIDE</label>
        <div className={styles.composerRow}>
          <input
            id="signal-local-question"
            value={draft}
            onChange={(inputEvent) => setDraft(inputEvent.target.value)}
            placeholder="Ask about the work…"
            autoComplete="off"
          />
          <button type="submit" disabled={!draft.trim()}>
            <ToolIcon src={PIXEL_OS_ASSETS.signalToolSend} />
            <span>SEND</span>
          </button>
        </div>
      </form>
    </section>
  )
}
