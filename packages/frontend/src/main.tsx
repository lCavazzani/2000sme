import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Generated tokens must precede every consumer stylesheet.
import 'virtual:pixelos-tokens.css'
import './globals.css'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './theme/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
