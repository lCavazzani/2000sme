import { useEffect } from 'react'
import { Window } from './components/Window'
import { WindowsProvider, useWindows } from './store/windows'
import './App.css'

function Desktop() {
  const { windows, openWindow } = useWindows()

  useEffect(() => {
    openWindow({ // open a default one for test
      id: 'portfolio',
      title: 'My Portfolio',
      x: 64,
      y: 64,
      width: 480,
      height: 320,
    })
  }, [openWindow])

  return (
    <div className="desktop">
      {windows.map((win) => ( //map over windows array to render all windows
        <Window key={win.id} id={win.id}>
          <p>Welcome to my portfolio.</p>
        </Window>
      ))}
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
