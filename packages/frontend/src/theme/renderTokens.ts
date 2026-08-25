// Explicit extension: this module is also loaded by vite.config.ts, which
// resolves as nodenext.
import { osTokens, pixelosRootAliases, pixelosTokens } from './palette.ts'

/**
 * Pure renderer for `generated/tokens.css`.
 *
 * Kept free of Node built-ins so both the codegen script and the in-browser
 * test suite can call it; `scripts/generate-tokens.mjs` supplies the file IO.
 */
function block(selector: string, entries: Record<string, string>, comment: string) {
  const declarations = Object.entries(entries)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join('\n')

  return `/* ${comment} */\n${selector} {\n${declarations}\n}`
}

function prefix(entries: Record<string, string>, namespace: string) {
  return Object.fromEntries(Object.entries(entries).map(([name, value]) => [`${namespace}-${name}`, value]))
}

export function renderTokensCss() {
  return [
    '/* GENERATED FILE — do not edit.',
    ' * Source: src/theme/palette.ts · Regenerate: pnpm tokens',
    ' */',
    '',
    block(
      ':root',
      { ...prefix(osTokens, 'os'), ...prefix(pixelosRootAliases, 'pixelos') },
      'Application tokens and shorthand aliases.',
    ),
    '',
    block(":root[data-os-theme='pixelos']", prefix(pixelosTokens, 'pixelos'), 'Shell tokens, scoped to the PixelOS theme.'),
    '',
  ].join('\n')
}
