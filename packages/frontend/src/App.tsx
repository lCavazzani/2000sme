import { DesktopShell } from './components/DesktopShell'
import { WindowsProvider } from './store/windows'
import './App.css'

function App() {
  return (
    <WindowsProvider>
      <DesktopShell />
    </WindowsProvider>
  )
}

export default App
