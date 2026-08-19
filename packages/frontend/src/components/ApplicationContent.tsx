import { findApplication } from '../config/applicationRegistry'
import { ProjectDetail } from './ProjectDetail'

type ApplicationContentProps = {
  windowId: string
  title: string
}

/**
 * Resolves window content from the application registry while retaining the
 * project-detail and generic fallbacks used by the desktop shell.
 */
export function ApplicationContent({ windowId, title }: ApplicationContentProps) {
  const application = findApplication(windowId)
  const Renderer = application?.renderer

  if (Renderer) return <Renderer />
  if (windowId.startsWith('project-detail-')) {
    return <ProjectDetail projectId={windowId.replace('project-detail-', '')} />
  }

  return <p>Welcome to {title}.</p>
}
