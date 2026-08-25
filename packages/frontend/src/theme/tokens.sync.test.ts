import { describe, expect, it } from 'vitest'
import { osTokens, palette, pixelosTokens } from './palette'
import { renderTokensCss } from './renderTokens'

/**
 * Guards the property that previously broke: colour literals living outside the
 * palette module drift when the palette is retuned. Inline SVG glyph fills in
 * the shell had gone stale against two prior repaints before this existed.
 */
describe('design tokens', () => {
  const css = renderTokensCss()
  const allowedColors = new Set(Object.values(palette).map((value) => value.toLowerCase()))

  it('emits no colour outside the palette ramp', () => {
    const declared = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(([hex]) => hex.toLowerCase())

    expect([...new Set(declared)].filter((hex) => !allowedColors.has(hex))).toEqual([])
  })

  it('publishes both namespaces from one source', () => {
    expect(css).toContain(':root {')
    expect(css).toContain(":root[data-os-theme='pixelos'] {")

    for (const name of Object.keys(osTokens)) expect(css).toContain(`--os-${name}:`)
    for (const name of Object.keys(pixelosTokens)) expect(css).toContain(`--pixelos-${name}:`)
  })

  it('keeps the two namespaces on the same ramp', () => {
    expect(osTokens.panel).toBe(pixelosTokens.panel)
    expect(osTokens.cyan).toBe(pixelosTokens.cyan)
    expect(osTokens.magenta).toBe(pixelosTokens.magenta)
    expect(osTokens.edge).toBe(pixelosTokens.edge)
    expect(osTokens.ink).toBe(pixelosTokens.ink)
    expect(osTokens.muted).toBe(pixelosTokens.muted)
  })
})
