import type { ApplicationId } from '../../config/applicationRegistry'
import { findApplication } from '../../config/applicationRegistry'
import { ApplicationContent } from './ApplicationContent'

type DirectApplicationRouteProps = {
  applicationId: ApplicationId
  onOpenDesktop: () => void
}

/**
 * Presents a registry-backed application outside the desktop shell. Returning
 * is explicit so focus recovery remains controlled by the stateful shell.
 */
export function DirectApplicationRoute({ applicationId, onOpenDesktop }: DirectApplicationRouteProps) {
  const application = findApplication(applicationId)
  if (!application) return null

  return (
    <main className="directRoute" aria-label={`${application.label} direct route`}>
      <button type="button" className="directRouteBack" onClick={onOpenDesktop}>
        Open desktop
      </button>
      <h1>{application.label}</h1>
      <ApplicationContent windowId={application.id} title={application.title} />
    </main>
  )
}
