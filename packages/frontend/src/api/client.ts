export type ApiErrorDetails = Record<string, string | number>

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: ApiErrorDetails
  readonly retryAfterSeconds?: number

  constructor({
    status,
    code,
    message,
    details,
    retryAfterSeconds,
  }: {
    status: number
    code: string
    message: string
    details?: ApiErrorDetails
    retryAfterSeconds?: number
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.retryAfterSeconds = retryAfterSeconds
  }
}

type ApiErrorResponse = {
  error: string
  code: string
  details?: ApiErrorDetails
  retry_after_seconds?: number
}

type JsonParser<T> = (value: unknown) => T

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export async function requestJson<T>({
  url,
  init,
  parse,
}: {
  url: string
  init?: RequestInit
  parse: JsonParser<T>
}): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error

    throw new ApiError({
      status: 0,
      code: 'network_error',
      message: 'Could not reach the guestbook service. Please check your connection and try again.',
    })
  }

  const payload = await response.json().catch(() => undefined)

  if (!response.ok) throw parseApiError(response, payload)

  try {
    return parse(payload)
  } catch (error) {
    if (isApiError(error)) throw error

    throw new ApiError({
      status: response.status,
      code: 'invalid_response',
      message: 'The guestbook service returned an invalid response. Please try again later.',
    })
  }
}

function parseApiError(response: Response, payload: unknown): ApiError {
  if (isApiErrorResponse(payload)) {
    return new ApiError({
      status: response.status,
      code: payload.code,
      message: payload.error,
      details: payload.details,
      retryAfterSeconds: payload.retry_after_seconds,
    })
  }

  return new ApiError({
    status: response.status,
    code: 'unexpected_error',
    message: response.status >= 500
      ? 'The guestbook service is unavailable. Please try again later.'
      : 'The guestbook request could not be completed. Please try again.',
  })
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value) || typeof value.error !== 'string' || typeof value.code !== 'string') return false

  return (
    (value.details === undefined || isDetails(value.details))
    && (value.retry_after_seconds === undefined || typeof value.retry_after_seconds === 'number')
  )
}

function isDetails(value: unknown): value is ApiErrorDetails {
  return isRecord(value) && Object.values(value).every((detail) => typeof detail === 'string' || typeof detail === 'number')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
