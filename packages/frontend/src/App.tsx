import { useEffect, useState } from 'react'
import { DesktopIcon } from './components/DesktopIcon'
import { MobileLauncher } from './components/MobileLauncher'
import { ProjectDetail } from './components/ProjectDetail'
import { Taskbar } from './components/Taskbar'
import { Window } from './components/Window'
import {
  applicationIdFromHash,
  applicationsForSurface,
  findApplication,
  type ApplicationId,
} from './config/applicationRegistry'
import { WindowsProvider, useWindows } from './store/windows'
import './App.css'

function ApplicationContent({ windowId, title }: { windowId: string; title: string }) {
  const application = findApplication(windowId)
  const Renderer = application?.renderer

  if (Renderer) return <Renderer />
  if (windowId.startsWith('project-detail-')) {
    return <ProjectDetail projectId={windowId.replace('project-detail-', '')} />
  }

  return <p>Welcome to {title}.</p>
}

function DirectApplicationRoute({ applicationId }: { applicationId: ApplicationId }) {
  const application = findApplication(applicationId)
  if (!application) return null

  return (
    <main className="directRoute" aria-label={`${application.label} direct route`}>
      <a href="#" className="directRouteBack">Open desktop</a>
      <h1>{application.label}</h1>
      <ApplicationContent windowId={application.id} title={application.title} />
    </main>
  )
}

function Desktop() {
  const { windows, openWindowById } = useWindows()
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null)
  const [hash, setHash] = useState(() => window.location.hash)
  const directApplicationId = applicationIdFromHash(hash)

  useEffect(() => {
    openWindowById('portfolio')
  }, [openWindowById])

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || !/^Digit[1-6]$/.test(event.code)) return
      const application = applicationsForSurface('desktop').find((candidate) => candidate.shortcut === `Alt+${event.key}`)
      if (!application) return
      event.preventDefault()
      openWindowById(application.id)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openWindowById])

  if (directApplicationId) return <DirectApplicationRoute applicationId={directApplicationId} />

  return (
    <main className="desktop" aria-label="Desktop" data-desktop-root tabIndex={-1}>
      <MobileLauncher />
      <section className="desktopIcons" aria-label="Desktop applications">
        {applicationsForSurface('desktop').map((application) => (
          <DesktopIcon
            key={application.id}
            label={application.label}
            icon={application.icon}
            windowId={application.id}
            isSelected={selectedWindowId === application.id}
            onSelect={setSelectedWindowId}
          />
        ))}
      </section>
      {windows.map((windowState) => (
        <Window key={windowState.id} id={windowState.id}>
          <ApplicationContent windowId={windowState.id} title={windowState.title} />
        </Window>
      ))}
      <Taskbar />
    </main>
  )
}

function App() {
  return (
    <WindowsProvider>
      <Desktop />
    </WindowsProvider>
  )
}

export default App
