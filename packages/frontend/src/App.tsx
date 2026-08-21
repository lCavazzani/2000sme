import { PixelOSIntroGate } from './components/PixelOSIntroGate'
import { WindowsProvider } from './store/windows'
import './App.css'

function App() {
  return (
    <WindowsProvider>
      <PixelOSIntroGate />
    </WindowsProvider>
  )
}

export default App
