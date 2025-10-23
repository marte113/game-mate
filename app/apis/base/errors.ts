import "server-only"

// 함수형 에러 생성 함수들
export function createRepositoryError(context: string, cause?: unknown): Error {
  const error = new Error(`[Repository] ${context}`)
  error.name = "RepositoryError"
  ;(error as any).cause = cause
  return error
}

export function createServiceError(context: string, cause?: unknown): Error {
  const error = new Error(`[Service] ${context}`)
  error.name = "ServiceError"
  ;(error as any).cause = cause
  return error
}

export function createUnauthorizedError(message = "Unauthorized"): Error {
  const error = new Error(message)
  error.name = "UnauthorizedError"
  return error
}

export function createForbiddenError(message = "Forbidden"): Error {
  const error = new Error(message)
  error.name = "ForbiddenError"
  return error
}

export function createBadRequestError(message = "Bad Request"): Error {
  const error = new Error(message)
  error.name = "BadRequestError"
  return error
}

export function createNotFoundError(message = "Not Found"): Error {
  const error = new Error(message)
  error.name = "NotFoundError"
  return error
}

export function createGoneError(message = "Gone"): Error {
  const error = new Error(message)
  error.name = "GoneError"
  return error
}

export function createConflictError(message = "Conflict"): Error {
  const error = new Error(message)
  error.name = "ConflictError"
  return error
}

export function createValidationError(
  message = "Validation Error",
  details?: Record<string, string[]>,
): Error {
  const error = new Error(message)
  error.name = "ValidationError"
  ;(error as any).details = details
  return error
}

// 타입 가드 함수들
export function isRepositoryError(error: unknown): error is Error & { cause?: unknown } {
  return error instanceof Error && error.name === "RepositoryError"
}

export function isServiceError(error: unknown): error is Error & { cause?: unknown } {
  return error instanceof Error && error.name === "ServiceError"
}

export function isValidationError(
  error: unknown,
): error is Error & { details?: Record<string, string[]> } {
  return error instanceof Error && error.name === "ValidationError"
}

export async function wrapRepo<T>(context: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    // 이미 정의된 에러 타입들은 그대로 throw (레이어 간 에러 보존)
    if (
      e instanceof Error &&
      (e.name === "UnauthorizedError" ||
        e.name === "ForbiddenError" ||
        e.name === "BadRequestError" ||
        e.name === "NotFoundError" ||
        e.name === "GoneError" ||
        e.name === "ConflictError" ||
        e.name === "ValidationError")
    ) {
      throw e
    }
    // DB 에러 등 알 수 없는 에러만 RepositoryError로 래핑
    throw createRepositoryError(context, e)
  }
}

export async function wrapService<T>(context: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    // 이미 정의된 에러 타입들은 그대로 throw (비즈니스 로직 에러 보존)
    if (
      e instanceof Error &&
      (e.name === "UnauthorizedError" ||
        e.name === "ForbiddenError" ||
        e.name === "BadRequestError" ||
        e.name === "NotFoundError" ||
        e.name === "GoneError" ||
        e.name === "ConflictError" ||
        e.name === "ValidationError")
    ) {
      throw e
    }
    // 알 수 없는 에러만 ServiceError로 래핑
    throw createServiceError(context, e)
  }
}
