import { useEffect } from 'react'
import { Window } from './components/Window'
import { ThemeDemo } from './routes/ThemeDemo'
import { WindowsProvider, useWindows } from './store/windows'
import { ThemeProvider } from './theme/ThemeProvider'
import './App.css'

const portfolioWindow = { id: 'portfolio', title: 'My Portfolio', x: 64, y: 64, width: 480, height: 320 }

function Desktop() {
  const { windows, openWindow } = useWindows()
  useEffect(() => { openWindow(portfolioWindow) }, [openWindow])
  return <main className="desktop" aria-label="Desktop">{windows.map((windowState) => <Window key={windowState.id} id={windowState.id}><p>Welcome to my portfolio.</p></Window>)}</main>
}

function Application() { return window.location.pathname === '/theme-demo' ? <ThemeDemo /> : <Desktop /> }

function App() { return <ThemeProvider><WindowsProvider><Application /></WindowsProvider></ThemeProvider> }

export default App
