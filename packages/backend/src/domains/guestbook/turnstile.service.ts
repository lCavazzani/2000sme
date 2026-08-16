const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileValidationResult =
  | { status: 'valid' }
  | { status: 'invalid' }
  | { status: 'unavailable' }

export type TurnstileVerifier = (
  token: string,
  secret: string | undefined,
  remoteIp: string | undefined,
) => Promise<TurnstileValidationResult>

type SiteverifyResponse = {
  success?: unknown
  action?: unknown
}

type FetchImplementation = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export async function validateTurnstileToken(
  token: string,
  secret: string | undefined,
  remoteIp: string | undefined,
  fetchImplementation: FetchImplementation = fetch,
): Promise<TurnstileValidationResult> {
  if (!secret) return { status: 'unavailable' }

  const formData = new FormData()
  formData.set('secret', secret)
  formData.set('response', token)
  if (remoteIp) formData.set('remoteip', remoteIp)

  try {
    const response = await fetchImplementation(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) return { status: 'unavailable' }

    const result = (await response.json()) as SiteverifyResponse
    return result.success === true && result.action === 'guestbook' ? { status: 'valid' } : { status: 'invalid' }
  } catch {
    return { status: 'unavailable' }
  }
}
