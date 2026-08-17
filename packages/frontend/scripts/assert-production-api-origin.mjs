import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const distDirectory = resolve('dist')
const forbiddenOrigin = /https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?/i

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  }))

  return paths.flat()
}

const artifactFiles = await collectFiles(distDirectory)
const violations = []

for (const artifactFile of artifactFiles) {
  const content = await readFile(artifactFile, 'utf8')
  if (forbiddenOrigin.test(content)) violations.push(artifactFile)
}

if (violations.length > 0) {
  throw new Error(`Production frontend artifact contains a localhost or private-network origin: ${violations.join(', ')}`)
}

console.log('Production frontend artifact contains no localhost or private-network API origin.')
