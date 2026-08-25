/**
 * Fails when an OS-chrome stylesheet declares a colour literal instead of
 * consuming a design token from `src/theme/palette.ts`.
 *
 * This runs as a Node script rather than a Vitest case on purpose: Vitest stubs
 * CSS imports by default (`css: false`), so a test that imports stylesheets and
 * scans them passes vacuously against empty strings. Reading the files directly
 * is the only way for this gate to mean anything.
 *
 * Scope is deliberately the shell. Application and game stylesheets (WordPad,
 * Minesweeper, NIGHTSHIFT) carry their own art palettes; widening the rule
 * should be a deliberate decision, not a side effect of this script.
 *
 * Run: pnpm --filter 00sfrontend lint:tokens
 */
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '../src')

const SHELL_STYLESHEETS = [
  'App.css',
  'globals.css',
  'index.css',
  'theme/pixelos.css',
  'components/PixelOSIntroGate.module.css',
  'components/shell/ApplicationBoundary.module.css',
  'components/shell/DesktopIcon.module.css',
  'components/shell/MobileLauncher.module.css',
  'components/shell/Taskbar.module.css',
  'components/shell/ThemeSystemIcon.module.css',
  'components/shell/Window.module.css',
]

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}\b/g
const FUNCTIONAL_COLOR = /\b(?:rgba?|hsla?|oklch|lab)\([^)]*\)/g

/**
 * Pure-black scrims are allowed: a drop shadow is an opacity effect rather than
 * a palette colour, and tinting it would make elevation track the hue.
 */
const NEUTRAL_SCRIM = /^rgba?\(\s*0[\s,]+0[\s,]+0\b/

function findLiterals(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const hexes = [...stripped.matchAll(HEX_LITERAL)].map(([match]) => match)
  const functional = [...stripped.matchAll(FUNCTIONAL_COLOR)]
    .map(([match]) => match)
    .filter((match) => !NEUTRAL_SCRIM.test(match))

  return [...hexes, ...functional]
}

// Self-check: a silently broken matcher would make this gate useless, which is
// exactly the failure mode that replaced the earlier Vitest version.
const positive = findLiterals('.a { color: #171a2a; background: rgb(23 26 42 / 14%); }')
if (positive.length !== 2) {
  console.error(`Literal matcher is broken: expected 2 detections, got ${positive.length}.`)
  process.exit(1)
}
if (findLiterals('.a { box-shadow: 3px 3px 0 rgb(0 0 0 / 42%); }').length !== 0) {
  console.error('Literal matcher should permit neutral black scrims.')
  process.exit(1)
}

const violations = []
for (const relativePath of SHELL_STYLESHEETS) {
  const css = await readFile(resolve(srcDir, relativePath), 'utf8')
  const literals = findLiterals(css)
  if (literals.length > 0) violations.push({ relativePath, literals })
}

if (violations.length > 0) {
  console.error('Shell stylesheets must consume design tokens from theme/palette.ts.\n')
  for (const { relativePath, literals } of violations) {
    console.error(`  src/${relativePath}`)
    for (const literal of [...new Set(literals)]) console.error(`    ${literal}`)
  }
  console.error('\nReplace each literal with the matching var(--os-*) or var(--pixelos-*) token.')
  process.exit(1)
}

console.log(`Shell token check passed: ${SHELL_STYLESHEETS.length} stylesheets, no colour literals.`)
