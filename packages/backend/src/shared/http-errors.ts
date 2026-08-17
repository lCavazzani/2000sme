export type ApiErrorBody = {
  error: string
  code: string
  details?: Record<string, string | number>
  retry_after_seconds?: number
}

export type ApiError = {
  body: ApiErrorBody
  init: {
    status: 400 | 404 | 413 | 429 | 500
    headers?: Record<string, string>
  }
}

export function apiError(
  status: ApiError['init']['status'],
  code: string,
  error: string,
  options: { details?: Record<string, string | number>; retryAfterSeconds?: number } = {},
): ApiError {
  return {
    body: {
      error,
      code,
      ...(options.details ? { details: options.details } : {}),
      ...(options.retryAfterSeconds ? { retry_after_seconds: options.retryAfterSeconds } : {}),
    },
    init: {
      status,
      ...(options.retryAfterSeconds ? { headers: { 'Retry-After': String(options.retryAfterSeconds) } } : {}),
    },
  }
}
