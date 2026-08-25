import { useMemo, useState } from 'react'
import { projects } from '../../config/projects'
import styles from './FileExplorer.module.css'

type MachineItem = {
  id: string
  name: string
  detail: string
  kind: 'drive' | 'folder'
}

function PixelMachineGlyph({ kind }: { kind: MachineItem['kind'] }) {
  if (kind === 'drive') {
    return (
      <svg viewBox="0 0 32 32" className={styles.machineGlyph} aria-hidden="true">
        <path d="M3 9h26v15H3z" fill="currentColor" />
        <path d="M6 12h20v5H6z" fill="var(--os-edge)" />
        <path d="M22 20h3v3h-3z" fill="var(--os-cyan)" />
        <path d="M7 20h11v3H7z" fill="var(--pixelos-bevel-highlight)" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 32 32" className={styles.machineGlyph} aria-hidden="true">
      <path d="M3 8h11l3 3h12v14H3z" fill="currentColor" />
      <path d="M5 13h22v10H5z" fill="var(--os-app-toolbar-surface)" />
      <path d="M5 13h22v3H5z" fill="var(--os-cyan)" />
    </svg>
  )
}

/**
 * PixelOS keeps real portfolio metadata but renders it through the supplied
 * My Machine layout. There are no fabricated machine volumes, external links,
 * or retired project-detail routes.
 */
export function FileExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const items = useMemo<MachineItem[]>(() => [
    {
      id: 'portfolio-drive',
      name: 'PORTFOLIO (C:)',
      detail: `${projects.length} retained portfolio project${projects.length === 1 ? '' : 's'}`,
      kind: 'drive',
    },
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      name: project.name.toUpperCase(),
      detail: `${project.year} · ${project.techStack.join(', ')}`,
      kind: 'folder' as const,
    })),
  ], [])
  const selectedItem = items.find((item) => item.id === selectedId)

  return (
    <section className={styles.root} aria-label="My Machine file browser">
      <nav className={styles.menuBar} aria-label="My Machine menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </nav>
      <div className={styles.pathBar}>
        <span className={styles.pathLabel}>Path</span>
        <div className={styles.pathField} aria-label="Current path">
          <PixelMachineGlyph kind="drive" />
          <span>C:\PORTFOLIO\</span>
          <span className={`pixelos-cursor-blink ${styles.cursor}`} aria-hidden="true">_</span>
        </div>
      </div>
      <ul className={styles.grid} aria-label="Portfolio machine objects">
        {items.map((item) => {
          const isSelected = selectedId === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.item} ${isSelected ? styles.selected : ''}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedId(item.id)}
              >
                <PixelMachineGlyph kind={item.kind} />
                <span>{item.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <footer className={styles.statusBar}>
        <span>{selectedItem ? selectedItem.detail : `${items.length} object(s)`}</span>
      </footer>
    </section>
  )
}
