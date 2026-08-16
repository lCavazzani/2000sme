import { useMemo } from 'react'
import { marked } from 'marked'
import resumeContent from '../content/resume.md?raw'
import { openPrintWindow } from '../utils/pdfGenerator'
import styles from './WordPad.module.css'

marked.use({ gfm: true, breaks: false })

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72]

export function WordPad() {
  const html = useMemo(() => marked.parse(resumeContent) as string, [])

  return (
    <div className={styles.root}>
      {/* ── Menu bar ── */}
      <div className={styles.menuBar}>
        {['File', 'Edit', 'View', 'Insert', 'Format', 'Help'].map((item) => (
          <button key={item} className={styles.menuItem}>
            {item}
          </button>
        ))}
      </div>

      {/* ── Main toolbar ── */}
      <div className={styles.toolbarRow}>
        <button title="New">&#128196;</button>
        <button title="Open">&#128193;</button>
        <button title="Save">&#128190;</button>
        <div role="separator" />
        <button title="Print">&#9113;</button>
        <button title="Print Preview">&#128270;</button>
        <div role="separator" />
        <button
          title="Download as PDF"
          className={styles.pdfBtn}
          onClick={() => openPrintWindow(html)}
        >
          &#11015; PDF
        </button>
        <div role="separator" />
        <button title="Find">&#128269;</button>
        <div role="separator" />
        <button title="Cut">&#9988;</button>
        <button title="Copy">&#128203;</button>
        <button title="Paste">&#128204;</button>
        <button title="Undo">&#8617;</button>
        <div role="separator" />
        <button title="Date / Time">&#128336;</button>
      </div>

      {/* ── Format toolbar ── */}
      <div className={styles.toolbarRow}>
        <label className={styles.toolbarLabel} htmlFor="wordpad-font">Font</label>
        <select id="wordpad-font" className={styles.fontSelect} defaultValue="Times New Roman" title="Font">
          {['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <label className={styles.toolbarLabel} htmlFor="wordpad-size">Size</label>
        <select id="wordpad-size" className={styles.sizeSelect} defaultValue="12" title="Size">
          {FONT_SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div role="separator" />
        <button title="Bold" className={styles.fmtBtn}>
          <b>B</b>
        </button>
        <button title="Italic" className={styles.fmtBtn}>
          <i>I</i>
        </button>
        <button title="Underline" className={styles.fmtBtn}>
          <u>U</u>
        </button>
        <div role="separator" />
        <button title="Colour" className={`${styles.fmtBtn} ${styles.colourBtn}`}>A</button>
        <div role="separator" />
        <button title="Align Left" className={styles.fmtBtn}>&#8676;</button>
        <button title="Centre" className={styles.fmtBtn}>&#8596;</button>
        <button title="Align Right" className={styles.fmtBtn}>&#8677;</button>
        <div role="separator" />
        <button title="Bullet List" className={styles.fmtBtn}>&#8801;</button>
      </div>

      {/* ── Document area ── */}
      <div className={styles.docArea}>
        <div
          className={styles.page}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* ── Status bar ── */}
      <div className="status-bar">
        <p className="status-bar-field">For Help, press F1</p>
        <p className="status-bar-field">NUM</p>
      </div>
    </div>
  )
}
