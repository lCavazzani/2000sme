import { useCallback, useMemo, useState } from 'react'
import { marked } from 'marked'
import resumeContent from '../../content/resume.md?raw'
import { openPrintWindow } from '../../utils/pdfGenerator'
import styles from './WordPad.module.css'

marked.use({ gfm: true, breaks: false })

const MENU_ITEMS = ['File', 'Edit', 'View', 'Insert', 'Format', 'Help']

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
    <section className={styles.root} aria-label="RESUME.PDF viewer">
      <div className={styles.menuBar} aria-label="PixelOS resume preview menu">
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

      <div className={styles.docArea} data-resume-document-area>
        <div
          className={styles.page}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <button
        type="button"
        className={styles.floatingDownload}
        onClick={downloadResume}
        aria-describedby="resume-download-help"
        aria-label="Download resume (PDF) — persistent action"
        title="Download resume (PDF)"
      >
        <span aria-hidden="true" className={styles.downloadIcon}>↓</span>
        Download PDF
      </button>

      <div className="status-bar" aria-label="PixelOS resume preview status">
        <p className="status-bar-field">Read-only RESUME.PDF preview</p>
        <p className="status-bar-field">PDF ready</p>
      </div>
    </section>
  )
}
