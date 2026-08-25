import type { ApplicationId } from '../../config/applicationRegistry'

export type SignalTopic = 'welcome' | 'projects' | 'resume' | 'experience' | 'skills' | 'about' | 'contact' | 'help' | 'fallback'

export type SignalGuideReply = {
  text: string
  action?: {
    applicationId: ApplicationId
    label: string
  }
}

export const SIGNAL_GUIDE_REPLIES: Record<SignalTopic, SignalGuideReply> = {
  welcome: {
    text: 'This is Leonardo’s local portfolio guide. Ask about projects, the resume, skills, or how this desktop works.',
  },
  projects: {
    text: 'MY MACHINE contains a portfolio-safe project grid and the work behind this PixelOS desktop.',
    action: { applicationId: 'my-computer', label: 'OPEN MY MACHINE' },
  },
  resume: {
    text: 'RESUME.PDF opens the focused experience summary inside PixelOS WordPad.',
    action: { applicationId: 'resume', label: 'OPEN RESUME' },
  },
  experience: {
    text: 'Leonardo is a Senior Frontend Developer who turns product direction into accessible, reliable interfaces and reusable systems.',
  },
  skills: {
    text: 'This portfolio demonstrates React, TypeScript, browser testing, accessibility, responsive UI systems, and careful state design.',
  },
  about: {
    text: 'ABOUT PIXELOS explains the local desktop experiment, its visual vocabulary, and its privacy-first boundaries.',
    action: { applicationId: 'about', label: 'OPEN ABOUT PIXELOS' },
  },
  contact: {
    text: 'This is a local guide, not a contact service. No message is sent or stored here; the Resume provides the available portfolio context.',
  },
  help: {
    text: 'Use PROJECTS, RESUME, or ABOUT, type a local topic, or trigger one bounded WINK or ATTENTION event. Nothing leaves this browser.',
  },
  fallback: {
    text: 'This local portfolio guide matches projects, resume, experience, skills, about, contact, or help. Nothing you type is sent or stored.',
  },
}

const TOPIC_MATCHERS: readonly [SignalTopic, readonly string[]][] = [
  ['projects', ['project', 'work', 'machine']],
  ['resume', ['resume', 'cv', 'career']],
  ['experience', ['experience', 'senior', 'frontend']],
  ['skills', ['skill', 'react', 'typescript', 'accessibility']],
  ['about', ['about', 'pixelos', 'desktop']],
  ['contact', ['contact', 'email', 'message']],
  ['help', ['help', 'guide', 'how']],
]

export function normalizeSignalInput(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function signalTopicFromInput(value: string): SignalTopic {
  const normalized = normalizeSignalInput(value)
  if (!normalized) return 'fallback'

  return TOPIC_MATCHERS.find(([, matchers]) => matchers.some((matcher) => normalized.includes(matcher)))?.[0] ?? 'fallback'
}

export function visitorPromptForTopic(topic: SignalTopic): string {
  return {
    welcome: 'Hello, local portfolio guide.',
    projects: 'Show me the projects.',
    resume: 'Open the resume.',
    experience: 'Tell me about Leonardo’s experience.',
    skills: 'What skills are represented here?',
    about: 'What is PixelOS?',
    contact: 'How does contact work here?',
    help: 'How can this local guide help?',
    fallback: 'Ask the local portfolio guide a question.',
  }[topic]
}
