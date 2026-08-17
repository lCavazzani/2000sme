const backendOrigin = process.env.BACKEND_SMOKE_ORIGIN ?? 'https://00sbackedn.cavazzanileonardo.workers.dev'
const origin = backendOrigin.replace(/\/+$/, '')

async function expectSuccess(path) {
  const response = await fetch(`${origin}${path}`)
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status} ${response.statusText}`)
  }

  return response
}

const health = await expectSuccess('/api/health')
if ((await health.text()).trim() !== 'ok') {
  throw new Error('/api/health did not return the expected ok payload')
}

const guestbook = await expectSuccess('/api/guestbook?limit=20')
const payload = await guestbook.json()

if (!Array.isArray(payload.entries) || typeof payload.page !== 'object' || payload.page === null) {
  throw new Error('/api/guestbook did not return the expected bounded payload contract')
}

if (payload.entries.length > 20) {
  throw new Error('/api/guestbook returned more entries than the requested limit')
}

console.log(`Backend smoke check passed for ${origin}.`)
