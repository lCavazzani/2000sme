import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const required = [
  'GITHUB_REPOSITORY',
  'GITHUB_REF_NAME',
  'GITHUB_SHA',
  'GITHUB_RUN_ID',
  'GITHUB_SERVER_URL',
]

const missing = required.filter((name) => !process.env[name])
if (missing.length > 0) {
  console.error(`Missing required release-evidence environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

const generatedAt = new Date().toISOString()
const repository = process.env.GITHUB_REPOSITORY
const branch = process.env.GITHUB_REF_NAME
const sha = process.env.GITHUB_SHA
const runId = process.env.GITHUB_RUN_ID
const serverUrl = process.env.GITHUB_SERVER_URL
const workflow = process.env.GITHUB_WORKFLOW ?? 'Deploy'
const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? '1'
const frontendUrl = process.env.PUBLIC_FRONTEND_URL ?? ''
const backendUrl = process.env.PUBLIC_BACKEND_URL ?? ''
const outputDirectory = resolve(process.env.RELEASE_EVIDENCE_DIR ?? 'release-evidence')
const runUrl = `${serverUrl}/${repository}/actions/runs/${runId}`

const manifest = {
  schemaVersion: 1,
  status: 'deployment-jobs-succeeded',
  generatedAt,
  repository,
  branch,
  commit: {
    sha,
    shortSha: sha.slice(0, 7),
  },
  workflow: {
    name: workflow,
    runId,
    runAttempt: Number(runAttempt),
    url: runUrl,
  },
  environments: {
    frontend: frontendUrl || null,
    backend: backendUrl || null,
  },
  evidence: {
    qualityJob: 'succeeded-before-deployment',
    backendDeployJob: 'succeeded',
    frontendDeployJob: 'succeeded',
    functionalSmokeCheck: 'not-run-by-this-evidence-step',
  },
  security: {
    containsSecrets: false,
    note: 'The manifest stores only non-sensitive release metadata and public URLs.',
  },
}

const summary = `# Release Evidence\n\n| Field | Value |\n|---|---|\n| Status | Deployment jobs succeeded |\n| Repository | \`${repository}\` |\n| Branch | \`${branch}\` |\n| Commit | [\`${sha.slice(0, 7)}\`](https://github.com/${repository}/commit/${sha}) |\n| Workflow run | [${workflow} #${runId}](${runUrl}) |\n| Generated at | ${generatedAt} |\n| Frontend | ${frontendUrl || 'Not configured'} |\n| Backend | ${backendUrl || 'Not configured'} |\n\n## Evidence Included\n\nThe quality job completed before deployment, and the backend and frontend deployment jobs completed successfully for the recorded commit. This bundle proves workflow completion and release provenance; it does not replace application-specific functional smoke checks.\n\n## Agent Preflight\n\nBefore treating this release as current production state, compare the recorded branch and commit with the relevant board ticket and inspect \`docs/PROJECT_CURRENT.md\` for known release risks.\n`

await mkdir(outputDirectory, { recursive: true })
await Promise.all([
  writeFile(resolve(outputDirectory, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`),
  writeFile(resolve(outputDirectory, 'release-summary.md'), summary),
])

console.log(`Release evidence created in ${outputDirectory}`)
console.log(`::notice title=Release evidence::${branch}@${sha.slice(0, 7)} recorded for run ${runId}`)
