import { findApplication } from '../../config/applicationRegistry'

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

  return <p>Welcome to {title}.</p>
}
