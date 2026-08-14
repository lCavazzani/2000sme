import { useState } from 'react'
import { AppearanceThemesWindow } from './components/AppearanceThemesWindow'
import { Taskbar } from './components/Taskbar'
import { DesktopIcon } from './components/DesktopIcon'
import { Window } from './components/Window'
import { desktopApps } from './config/desktopApps'
import { ThemeDemo } from './routes/ThemeDemo'
import { WindowsProvider, useWindows } from './store/windows'
import { ThemeProvider } from './theme/ThemeProvider'
import './App.css'

function WindowContent({ windowId, title }: { windowId: string; title: string }) {
  return windowId === 'appearance-themes' ? <AppearanceThemesWindow /> : <p>Welcome to {title}.</p>
}

function Desktop() {
  const { windows } = useWindows()
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null)
  return <main className="desktop" aria-label="Desktop"><section className="desktopIcons" aria-label="Desktop applications">{desktopApps.map((app) => <DesktopIcon key={app.id} label={app.label} icon={app.icon} windowId={app.id} isSelected={selectedWindowId === app.id} onSelect={setSelectedWindowId} />)}</section>{windows.map((windowState) => <Window key={windowState.id} id={windowState.id}><WindowContent windowId={windowState.id} title={windowState.title} /></Window>)}<Taskbar /></main>
}

function Application() { return window.location.pathname === '/theme-demo' ? <ThemeDemo /> : <Desktop /> }
function App() { return <ThemeProvider><WindowsProvider><Application /></WindowsProvider></ThemeProvider> }
export default App
