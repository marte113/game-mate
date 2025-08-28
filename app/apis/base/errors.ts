import 'server-only'

export class RepositoryError extends Error {
  constructor(public readonly context: string, public readonly cause?: unknown) {
    super(`[Repository] ${context}`)
  }
}

export class ServiceError extends Error {
  constructor(public readonly context: string, public readonly cause?: unknown) {
    super(`[Service] ${context}`)
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class BadRequestError extends Error {
  constructor(message = 'Bad Request') {
    super(message)
    this.name = 'BadRequestError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not Found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class ValidationError extends Error {
  constructor(
    message = 'Validation Error',
    public readonly details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export async function wrapRepo<T>(context: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    throw new RepositoryError(context, e)
  }
}

export async function wrapService<T>(context: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    throw new ServiceError(context, e)
  }
}


