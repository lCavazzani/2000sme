import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
// Explicit extension: tsconfig.node.json resolves as nodenext.
import { renderTokensCss } from './src/theme/renderTokens.ts'

const TOKENS_MODULE_ID = 'virtual:pixelos-tokens.css'

/**
 * Serves the design tokens as a virtual stylesheet generated from
 * `src/theme/palette.ts`.
 *
 * Nothing is written to disk, so the tokens cannot go stale relative to the
 * palette module — the previous hand-maintained duplicates in `globals.css`
 * and `theme/pixelos.css` are what let inline SVG fills drift off-palette.
 */
function pixelosTokens(): Plugin {
  const resolvedId = `\0${TOKENS_MODULE_ID}`

  return {
    name: 'pixelos-tokens',
    resolveId(id) {
      return id === TOKENS_MODULE_ID ? resolvedId : undefined
    },
    load(id) {
      return id === resolvedId ? renderTokensCss() : undefined
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pixelosTokens()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', '**/node_modules/**', '**/dist/**'],
  },
})
