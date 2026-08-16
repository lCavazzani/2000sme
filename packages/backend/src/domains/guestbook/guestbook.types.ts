export type GuestbookEntry = {
  id: number
  name: string
  message: string
  created_at: string
}

export type GuestbookCursor = {
  createdAt: string
  id: number
}

export type GuestbookInput = {
  name: string
  message: string
}

export type GuestbookSubmissionInput = GuestbookInput & {
  turnstileToken: string
}

export type GuestbookPage = {
  entries: GuestbookEntry[]
  page: {
    limit: number
    next_cursor: string | null
  }
}
