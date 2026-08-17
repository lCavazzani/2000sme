import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { marked } from 'marked'
import resumeContent from '../content/resume.md?raw'
import { openPrintWindow } from '../utils/pdfGenerator'
import styles from './WordPad.module.css'

marked.use({ gfm: true, breaks: false })

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72]
const MENU_ITEMS = ['File', 'Edit', 'View', 'Insert', 'Format', 'Help']
const TOOLBAR_ITEMS = [
  { label: 'New', icon: '📄' },
  { label: 'Open', icon: '📁' },
  { label: 'Save', icon: '💾' },
  { label: 'Print', icon: '⏎' },
  { label: 'Print Preview', icon: '🔎' },
  { label: 'Find', icon: '🔍' },
  { label: 'Cut', icon: '✂' },
  { label: 'Copy', icon: '📋' },
  { label: 'Paste', icon: '📌' },
  { label: 'Undo', icon: '↩' },
  { label: 'Date / Time', icon: '🕰' },
] as const

function DisabledPreviewButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button type="button" disabled aria-label={`${label} (unavailable in resume preview)`} title={`${label} is unavailable in this read-only preview`}>
      {children}
    </button>
  )
}

export function WordPad() {
  const html = useMemo(() => marked.parse(resumeContent) as string, [])
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  const downloadResume = useCallback(() => {
    const didOpen = openPrintWindow(html)
    setDownloadStatus(
      didOpen
        ? 'The resume print dialog opened in a new window. Choose Save as PDF to download it.'
        : 'The resume download could not open. Allow pop-ups for this site, then try again.',
    )
  }, [html])

  return (
    <section className={styles.root} aria-label="Resume viewer">
      <div className={styles.menuBar} aria-label="WordPad preview menu">
        {MENU_ITEMS.map((item) => (
          <button key={item} type="button" className={styles.menuItem} disabled title={`${item} is unavailable in this read-only preview`}>
            {item}
          </button>
        ))}
      </div>

      <div className={styles.primaryActionBar} aria-label="Resume download">
        <button
          type="button"
          className={styles.primaryDownload}
          onClick={downloadResume}
          aria-describedby="resume-download-help"
        >
          <span aria-hidden="true" className={styles.downloadIcon}>↓</span>
          Download resume (PDF)
        </button>
      </div>
      <p id="resume-download-help" className={styles.srOnly}>Opens the resume in a print dialog where you can save it as a PDF.</p>
      {downloadStatus && (
        <p className={styles.downloadStatus} role={downloadStatus.startsWith('The resume download could') ? 'alert' : 'status'}>
          {downloadStatus}
        </p>
      )}

      <div className={styles.toolbarRow} aria-label="Read-only document toolbar">
        {TOOLBAR_ITEMS.slice(0, 3).map((item) => (
          <DisabledPreviewButton key={item.label} label={item.label}>{item.icon}</DisabledPreviewButton>
        ))}
        <div role="separator" />
        {TOOLBAR_ITEMS.slice(3, 5).map((item) => (
          <DisabledPreviewButton key={item.label} label={item.label}>{item.icon}</DisabledPreviewButton>
        ))}
        <div role="separator" />
        {TOOLBAR_ITEMS.slice(5, 6).map((item) => (
          <DisabledPreviewButton key={item.label} label={item.label}>{item.icon}</DisabledPreviewButton>
        ))}
        <div role="separator" />
        {TOOLBAR_ITEMS.slice(6, 10).map((item) => (
          <DisabledPreviewButton key={item.label} label={item.label}>{item.icon}</DisabledPreviewButton>
        ))}
        <div role="separator" />
        {TOOLBAR_ITEMS.slice(10).map((item) => (
          <DisabledPreviewButton key={item.label} label={item.label}>{item.icon}</DisabledPreviewButton>
        ))}
      </div>

      <div className={styles.toolbarRow} aria-label="Read-only format toolbar">
        <label className={styles.toolbarLabel} htmlFor="wordpad-font">Font</label>
        <select id="wordpad-font" className={styles.fontSelect} defaultValue="Times New Roman" disabled>
          {['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map((font) => (
            <option key={font}>{font}</option>
          ))}
        </select>
        <label className={styles.toolbarLabel} htmlFor="wordpad-size">Size</label>
        <select id="wordpad-size" className={styles.sizeSelect} defaultValue="12" disabled>
          {FONT_SIZES.map((size) => (
            <option key={size}>{size}</option>
          ))}
        </select>
        <div role="separator" />
        <DisabledPreviewButton label="Bold"><b>B</b></DisabledPreviewButton>
        <DisabledPreviewButton label="Italic"><i>I</i></DisabledPreviewButton>
        <DisabledPreviewButton label="Underline"><u>U</u></DisabledPreviewButton>
        <div role="separator" />
        <DisabledPreviewButton label="Colour"><span className={styles.colourBtn}>A</span></DisabledPreviewButton>
        <div role="separator" />
        <DisabledPreviewButton label="Align Left">⇤</DisabledPreviewButton>
        <DisabledPreviewButton label="Centre">↔</DisabledPreviewButton>
        <DisabledPreviewButton label="Align Right">⇥</DisabledPreviewButton>
        <div role="separator" />
        <DisabledPreviewButton label="Bullet List">≡</DisabledPreviewButton>
      </div>

      <div className={styles.docArea}>
        <div
          className={styles.page}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <div className="status-bar" aria-label="WordPad preview status">
        <p className="status-bar-field">Read-only resume preview</p>
        <p className="status-bar-field">PDF ready</p>
      </div>
    </section>
  )
}
