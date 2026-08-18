import type { GuestbookEntry } from '../api/guestbook'

export type ScrapbookDecoration = {
  paper: 'ivory' | 'cream' | 'blue'
  tape: 'mint' | 'peach' | 'lilac'
  tilt: 'left' | 'flat' | 'right'
  corner: 'fold' | 'pin' | 'none'
  accent: 'sun' | 'wave' | 'dot'
}

const papers = ['ivory', 'cream', 'blue'] as const
const tapes = ['mint', 'peach', 'lilac'] as const
const tilts = ['left', 'flat', 'right'] as const
const corners = ['fold', 'pin', 'none'] as const
const accents = ['sun', 'wave', 'dot'] as const

export function decorationForEntry(entry: Pick<GuestbookEntry, 'id' | 'created_at'>): ScrapbookDecoration {
  const hash = stableHash(`${entry.id}:${entry.created_at}`)
  return {
    paper: papers[hash % papers.length],
    tape: tapes[(hash >>> 3) % tapes.length],
    tilt: tilts[(hash >>> 6) % tilts.length],
    corner: corners[(hash >>> 9) % corners.length],
    accent: accents[(hash >>> 12) % accents.length],
  }
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
