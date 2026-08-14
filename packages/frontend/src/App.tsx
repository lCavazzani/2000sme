import { useState } from 'react'
import { DesktopIcon } from './components/DesktopIcon'
import { Window } from './components/Window'
import { desktopApps } from './config/desktopApps'
import { WindowsProvider, useWindows } from './store/windows'
import './App.css'

function Desktop() {
  const { windows } = useWindows()
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null)

  return (
    <main className="desktop" aria-label="Desktop">
      <section className="desktopIcons" aria-label="Desktop applications">
        {desktopApps.map((app) => (
          <DesktopIcon
            key={app.id}
            label={app.label}
            icon={app.icon}
            windowId={app.id}
            isSelected={selectedWindowId === app.id}
            onSelect={setSelectedWindowId}
          />
        ))}
      </section>
      {windows.map((windowState) => (
        <Window key={windowState.id} id={windowState.id}>
          <p>Welcome to {windowState.title}.</p>
        </Window>
      ))}
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
