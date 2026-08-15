import { findProject } from '../config/projects'
import styles from './ProjectDetail.module.css'

type Props = {
  projectId: string
}

export function ProjectDetail({ projectId }: Props) {
  const project = findProject(projectId)

  if (!project) {
    return <p>Project not found.</p>
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <img src={project.icon} alt="" width={32} height={32} className={styles.icon} />
        <div>
          <strong className={styles.name}>{project.name}</strong>
          <div className={styles.year}>{project.year}</div>
        </div>
      </div>

      <fieldset>
        <legend>Description</legend>
        <p className={styles.description}>{project.description}</p>
      </fieldset>

      <fieldset>
        <legend>Tech Stack</legend>
        <div className={styles.tags}>
          {project.techStack.map((tech) => (
            <span key={tech} className={styles.tag}>
              {tech}
            </span>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Links</legend>
        <ul className={styles.links}>
          {project.links.map((link) => (
            <li key={link.label}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  )
}
