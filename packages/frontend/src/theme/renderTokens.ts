// Explicit extension: this module is also loaded by vite.config.ts, which
// resolves as nodenext.
import { osTokens, pixelosRootAliases, pixelosTokens } from './palette.ts'

/**
 * Renders the `--os-*` and `--pixelos-*` token blocks from the palette.
 *
 * The `pixelosTokens` plugin in `vite.config.ts` serves this as the virtual
 * stylesheet `virtual:pixelos-tokens.css`; nothing is written to disk. Kept free
 * of Node built-ins so the plugin and the test suite can both call it.
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
    ' * Source: src/theme/palette.ts · Served by the pixelosTokens Vite plugin.',
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
