import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const canonicalRoot = 'https://lcavazzani.com'
const expectedFragments = [
  {
    file: '.github/workflows/deploy.yml',
    fragment: `curl --fail --silent --show-error --retry 3 --retry-delay 3 ${canonicalRoot}/ | grep -q 'id="root"'`,
    purpose: 'production frontend smoke target',
  },
  {
    file: '.github/workflows/deploy.yml',
    fragment: `PUBLIC_FRONTEND_URL: ${canonicalRoot}`,
    purpose: 'release-evidence frontend endpoint',
  },
  {
    file: 'docs/PROJECT_CURRENT.md',
    fragment: `\`${canonicalRoot}\``,
    purpose: 'living production frontend reference',
  },
  {
    file: 'docs/development-environment.md',
    fragment: `\`${canonicalRoot}\``,
    purpose: 'production environment reference',
  },
  {
    file: 'packages/backend/seeds/projects.sql',
    fragment: `'sportifolio', 'Live', '${canonicalRoot}'`,
    purpose: 'public project catalog link',
  },
]

const missing = []
for (const { file, fragment, purpose } of expectedFragments) {
  const source = await readFile(resolve(root, file), 'utf8')
  if (!source.includes(fragment)) missing.push(`${file}: ${purpose}`)
}

if (missing.length > 0) {
  console.error(`Canonical production URL contract is incomplete for ${canonicalRoot}:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`Canonical production URL contract verified for ${canonicalRoot}.`)
