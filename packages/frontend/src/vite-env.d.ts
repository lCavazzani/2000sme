/// <reference types="vite/client" />

declare module '*?raw' {
  const content: string
  export default content
}

/** Design tokens generated from theme/palette.ts by the pixelosTokens plugin. */
declare module 'virtual:pixelos-tokens.css' {}
