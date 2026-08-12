import { useState } from 'react'
import { Window } from './components/Window'
import './App.css'

function App() {
  const [open, setOpen] = useState(true)
  const [minimized, setMinimized] = useState(false)

  if (!open) return null

  return (
    <div className="desktop">
      {!minimized && (
        <Window
          title="My Portfolio"
          onClose={() => setOpen(false)}
          onMinimize={() => setMinimized(true)}
        >
          <p>Welcome to my portfolio.</p>
        </Window>
      )}
    </div>
  )
}

export default App
