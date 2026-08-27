/// <reference types="vite/client" />

declare module '*?raw' {
  const content: string
  export default content
}

/** Processed CSS text. Unlike `?raw`, this works for `.module.css` files. */
declare module '*?inline' {
  const css: string
  export default css
}

/** Design tokens generated from theme/palette.ts by the pixelosTokens plugin. */
declare module 'virtual:pixelos-tokens.css' {}
