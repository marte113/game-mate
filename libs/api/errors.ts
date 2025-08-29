export type AppError = Error & { code?: string; status?: number; details?: unknown }

export function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && error !== null && 'message' in (error as any)
}

// 4xx는 재시도하지 않고, 5xx는 최대 2회 재시도
export function defaultRetry(failureCount: number, error: unknown) {
  const err = error as AppError
  if (err?.status && err.status >= 400 && err.status < 500) return false
  return failureCount < 2
}
