import { QueryClientProvider } from '@tanstack/react-query'
import { PixelOSIntroGate } from './components/PixelOSIntroGate'
import { appQueryClient } from './api/queryClient'
import { WindowsProvider } from './store/windows'
import './App.css'

// App owns its providers so every render path — including tests and the
// direct-route entry — gets the same context the browser entry point does.
function App() {
  return (
    <QueryClientProvider client={appQueryClient}>
      <WindowsProvider>
        <PixelOSIntroGate />
      </WindowsProvider>
    </QueryClientProvider>
  )
}

export default App
