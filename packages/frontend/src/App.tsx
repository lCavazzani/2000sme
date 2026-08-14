import { useEffect } from 'react'
import { Taskbar } from './components/Taskbar'
import { Window } from './components/Window'
import { WindowsProvider, useWindows } from './store/windows'
import './App.css'

const portfolioWindow = {
  id: 'portfolio',
  title: 'My Portfolio',
  x: 64,
  y: 64,
  width: 480,
  height: 320,
}

function Desktop() {
  const { windows, openWindow } = useWindows()

  useEffect(() => {
    openWindow(portfolioWindow)
  }, [openWindow])

  return (
    <div className="desktop">
      {windows.map((windowState) => (
        <Window key={windowState.id} id={windowState.id}>
          <p>Welcome to my portfolio.</p>
        </Window>
      ))}
      <Taskbar />
    </div>
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
