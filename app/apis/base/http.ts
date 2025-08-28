import 'server-only'

import { NextResponse } from 'next/server'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RepositoryError,
  ServiceError,
  UnauthorizedError,
  ValidationError,
} from './errors'

function codeOf(err: Error): string {
  switch (err.name) {
    case 'UnauthorizedError':
      return 'UNAUTHORIZED'
    case 'ForbiddenError':
      return 'FORBIDDEN'
    case 'BadRequestError':
      return 'BAD_REQUEST'
    case 'NotFoundError':
      return 'NOT_FOUND'
    case 'ConflictError':
      return 'CONFLICT'
    case 'ValidationError':
      return 'VALIDATION_ERROR'
    case 'RepositoryError':
    case 'ServiceError':
      return 'INTERNAL_SERVER_ERROR'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

function statusOf(err: Error): number {
  if (err instanceof UnauthorizedError) return 401
  if (err instanceof ForbiddenError) return 403
  if (err instanceof BadRequestError) return 400
  if (err instanceof NotFoundError) return 404
  if (err instanceof ConflictError) return 409
  if (err instanceof ValidationError) return 400
  return 500
}

export function toErrorResponse(e: unknown): NextResponse {
  const isError = e instanceof Error
  const err = isError ? (e as Error) : new Error('Unknown error')
  const status = statusOf(err)
  const code = codeOf(err)

  const base = {
    success: false,
    code,
    // 보안상 상세 메시지 노출 최소화. 도메인 에러는 메시지 사용.
    message:
      err instanceof BadRequestError ||
      err instanceof UnauthorizedError ||
      err instanceof ForbiddenError ||
      err instanceof NotFoundError ||
      err instanceof ConflictError ||
      err instanceof ValidationError
        ? err.message
        : '서버 오류가 발생했습니다.',
  } as any

  if (err instanceof ValidationError && err.details) {
    base.details = err.details
  }

  // 최소한의 서버 로그
  // RepositoryError/ServiceError 등은 내부 cause만 로그, 응답에는 노출하지 않음
  if (process.env.NODE_ENV !== 'production') {
    console.error('[API_ERROR]', err.name, err.message)
  }

  return NextResponse.json(base, { status })
}
