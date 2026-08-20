import { useMemo, useState } from 'react'
import styles from './PixelNotepad.module.css'

const INITIAL_README = `PIXEL OS 2.0

WELCOME, TRAVELLER.

THIS DESKTOP IS A SMALL PIXELOS PORTFOLIO.
OPEN THE APPLICATIONS MENU TO EXPLORE THE GALLERY,
MEET MITTENS, OR READ THE RESUME.

TYPE FREELY — THIS README LIVES ONLY IN THIS WINDOW.`

function cursorPosition(text: string, cursor: number) {
  const beforeCursor = text.slice(0, cursor)
  const lines = beforeCursor.split('\n')
  return { line: lines.length, column: lines.at(-1)?.length ?? 0 }
}

export function PixelNotepad() {
  const [text, setText] = useState(INITIAL_README)
  const [cursor, setCursor] = useState(0)
  const position = useMemo(() => cursorPosition(text, cursor), [text, cursor])

  return (
    <section className={styles.root} aria-label="README.TXT Notepad">
      <div className={styles.menuBar} aria-label="README.TXT menu">
        <span>File</span>
        <span>Edit</span>
        <span>Search</span>
        <span>Help</span>
      </div>

      <label className={styles.srOnly} htmlFor="readme-editor">README.TXT editor</label>
      <textarea
        id="readme-editor"
        className={styles.editor}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setCursor(event.target.selectionStart)
        }}
        onSelect={(event) => setCursor(event.currentTarget.selectionStart)}
        spellCheck={false}
        aria-describedby="readme-status"
      />

      <div id="readme-status" className={styles.status} aria-live="polite">
        <span>Ln {position.line}, Col {position.column + 1}</span>
        <span>{text.length} chars</span>
        <span className={styles.insertCue} aria-label="Insert mode">INS</span>
      </div>
    </section>
  )
}
