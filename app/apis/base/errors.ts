import 'server-only'

// 함수형 에러 생성 함수들
export function createRepositoryError(context: string, cause?: unknown): Error {
  const error = new Error(`[Repository] ${context}`)
  error.name = 'RepositoryError'
  ;(error as any).cause = cause
  return error
}

export function createServiceError(context: string, cause?: unknown): Error {
  const error = new Error(`[Service] ${context}`)
  error.name = 'ServiceError'
  ;(error as any).cause = cause
  return error
}

export function createUnauthorizedError(message = 'Unauthorized'): Error {
  const error = new Error(message)
  error.name = 'UnauthorizedError'
  return error
}

export function createForbiddenError(message = 'Forbidden'): Error {
  const error = new Error(message)
  error.name = 'ForbiddenError'
  return error
}

export function createBadRequestError(message = 'Bad Request'): Error {
  const error = new Error(message)
  error.name = 'BadRequestError'
  return error
}

export function createNotFoundError(message = 'Not Found'): Error {
  const error = new Error(message)
  error.name = 'NotFoundError'
  return error
}

export function createGoneError(message = 'Gone'): Error {
  const error = new Error(message)
  error.name = 'GoneError'
  return error
}

export function createConflictError(message = 'Conflict'): Error {
  const error = new Error(message)
  error.name = 'ConflictError'
  return error
}

export function createValidationError(
  message = 'Validation Error',
  details?: Record<string, string[]>
): Error {
  const error = new Error(message)
  error.name = 'ValidationError'
  ;(error as any).details = details
  return error
}

// 타입 가드 함수들
export function isRepositoryError(error: unknown): error is Error & { cause?: unknown } {
  return error instanceof Error && error.name === 'RepositoryError'
}

export function isServiceError(error: unknown): error is Error & { cause?: unknown } {
  return error instanceof Error && error.name === 'ServiceError'
}

export function isValidationError(error: unknown): error is Error & { details?: Record<string, string[]> } {
  return error instanceof Error && error.name === 'ValidationError'
}

export async function wrapRepo<T>(context: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    throw createRepositoryError(context, e)
  }
}

export async function wrapService<T>(context: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    throw createServiceError(context, e)
  }
}


