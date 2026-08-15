import { useState } from 'react'
import { useWindows } from '../store/windows'
import { projects, type Project } from '../config/projects'
import styles from './FileExplorer.module.css'

type View = 'icons' | 'list'

export function FileExplorer() {
  const [selectedNode, setSelectedNode] = useState<string>('root')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [view, setView] = useState<View>('icons')
  const { openWindow } = useWindows()

  const shownProjects =
    selectedNode === 'root' ? projects : projects.filter((p) => p.id === selectedNode)

  const selectedProject = projects.find((p) => p.id === selectedNode)
  const addressPath = selectedProject
    ? `C:\\Projects\\${selectedProject.name}`
    : 'C:\\Projects'

  function openProjectDetail(project: Project) {
    openWindow({
      id: `project-detail-${project.id}`,
      title: project.name,
      icon: project.icon,
      x: 140 + Math.floor(Math.random() * 80),
      y: 100 + Math.floor(Math.random() * 60),
      width: 500,
      height: 380,
    })
  }

  function selectNode(id: string) {
    setSelectedNode(id)
    setSelectedFile(null)
  }

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button
          aria-label="Up"
          disabled={selectedNode === 'root'}
          onClick={() => selectNode('root')}
          className={styles.navBtn}
        >
          ▲
        </button>
        <div className={styles.address}>
          <span className={styles.addressLabel}>Address</span>
          <input type="text" readOnly value={addressPath} className={styles.addressInput} />
        </div>
        <div className={styles.viewToggle}>
          <button
            title="Icon view"
            className={view === 'icons' ? styles.viewActive : ''}
            onClick={() => setView('icons')}
          >
            ⊞
          </button>
          <button
            title="List view"
            className={view === 'list' ? styles.viewActive : ''}
            onClick={() => setView('list')}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Two-pane body */}
      <div className={styles.body}>
        {/* Left: tree */}
        <div className={styles.treePane}>
          <ul className="tree-view" style={{ height: '100%' }}>
            <li>
              <details open>
                <summary>Desktop</summary>
                <ul>
                  <li>
                    <details open>
                      <summary onClick={() => selectNode('root')}>My Computer</summary>
                      <ul>
                        <li>
                          <details open>
                            <summary onClick={() => selectNode('root')}>
                              (C:) Projects
                            </summary>
                            <ul>
                              {projects.map((project) => (
                                <li
                                  key={project.id}
                                  className={[
                                    styles.treeLeaf,
                                    selectedNode === project.id ? styles.treeLeafSelected : '',
                                  ].join(' ')}
                                  onClick={() => selectNode(project.id)}
                                  onDoubleClick={() => openProjectDetail(project)}
                                >
                                  📁 {project.name}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      </ul>
                    </details>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Right: file pane */}
        <div className={styles.filePane}>
          {view === 'icons' ? (
            <div className={styles.iconGrid}>
              {shownProjects.map((project) => (
                <button
                  key={project.id}
                  className={[
                    styles.folder,
                    selectedFile === project.id ? styles.folderSelected : '',
                  ].join(' ')}
                  onClick={() => setSelectedFile(project.id)}
                  onDoubleClick={() => openProjectDetail(project)}
                >
                  <img
                    src={project.icon}
                    alt=""
                    width={32}
                    height={32}
                    className={styles.folderIcon}
                  />
                  <span className={styles.folderName}>{project.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <table className={styles.listTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Tech Stack</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {shownProjects.map((project) => (
                  <tr
                    key={project.id}
                    className={selectedFile === project.id ? styles.rowSelected : undefined}
                    onClick={() => setSelectedFile(project.id)}
                    onDoubleClick={() => openProjectDetail(project)}
                  >
                    <td className={styles.nameCell}>
                      <img
                        src={project.icon}
                        alt=""
                        width={16}
                        height={16}
                        className={styles.rowIcon}
                      />
                      {project.name}
                    </td>
                    <td>{project.year}</td>
                    <td>{project.techStack.join(', ')}</td>
                    <td>File Folder</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <p className="status-bar-field">
          {shownProjects.length} object{shownProjects.length !== 1 ? 's' : ''}
        </p>
        <p className="status-bar-field">
          {selectedFile ? projects.find((p) => p.id === selectedFile)?.name : ''}
        </p>
      </div>
    </div>
  )
}
