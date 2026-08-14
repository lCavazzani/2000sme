import { useState } from 'react'
import { Taskbar } from './components/Taskbar'
import { DesktopIcon } from './components/DesktopIcon'
import { Window } from './components/Window'
<<<<<<< HEAD
import { desktopApps } from './config/desktopApps'
=======
import { ThemeDemo } from './routes/ThemeDemo'
>>>>>>> feat/theme-1-runtime-css-isolation
import { WindowsProvider, useWindows } from './store/windows'
import { ThemeProvider } from './theme/ThemeProvider'
import './App.css'

const portfolioWindow = { id: 'portfolio', title: 'My Portfolio', x: 64, y: 64, width: 480, height: 320 }

function Desktop() {
<<<<<<< HEAD
  const { windows } = useWindows()
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null)

  return (
    <main className="desktop" aria-label="Desktop">
      <section className="desktopIcons" aria-label="Desktop applications">
        {desktopApps.map((app) => (
          <DesktopIcon key={app.id} label={app.label} icon={app.icon} windowId={app.id} isSelected={selectedWindowId === app.id} onSelect={setSelectedWindowId} />
        ))}
      </section>
      {windows.map((windowState) => (
        <Window key={windowState.id} id={windowState.id}><p>Welcome to {windowState.title}.</p></Window>
      ))}
      <Taskbar />
    </main>
  )
}
=======
  const { windows, openWindow } = useWindows()
  useEffect(() => { openWindow(portfolioWindow) }, [openWindow])
  return <main className="desktop" aria-label="Desktop">{windows.map((windowState) => <Window key={windowState.id} id={windowState.id}><p>Welcome to my portfolio.</p></Window>)}</main>
}

function Application() { return window.location.pathname === '/theme-demo' ? <ThemeDemo /> : <Desktop /> }

function App() { return <ThemeProvider><WindowsProvider><Application /></WindowsProvider></ThemeProvider> }
>>>>>>> feat/theme-1-runtime-css-isolation

function App() { return <WindowsProvider><Desktop /></WindowsProvider> }
export default App
