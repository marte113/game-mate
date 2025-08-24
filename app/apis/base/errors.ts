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


