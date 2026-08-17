import { expect, test } from 'vitest'
import { applicationIdFromHash } from '../config/applicationRegistry'

const legacyThemeDemoFiles = import.meta.glob('./ThemeDemo.{tsx,css}')

test('keeps the legacy ThemeDemo harness removed from supported application paths', () => {
  expect(Object.keys(legacyThemeDemoFiles)).toEqual([])
  expect(applicationIdFromHash('#/apps/theme-demo')).toBeUndefined()
})
