import 'server-only'

import { NextResponse } from 'next/server'
import { isValidationError } from './errors'

function getErrorCode(errorName: string): string {
  const codeMap: Record<string, string> = {
    'UnauthorizedError': 'UNAUTHORIZED',
    'ForbiddenError': 'FORBIDDEN',
    'BadRequestError': 'BAD_REQUEST',
    'NotFoundError': 'NOT_FOUND',
    'GoneError': 'GONE',
    'ConflictError': 'CONFLICT',
    'ValidationError': 'VALIDATION_ERROR',
    'RepositoryError': 'INTERNAL_SERVER_ERROR',
    'ServiceError': 'INTERNAL_SERVER_ERROR',
  }
  return codeMap[errorName] ?? 'INTERNAL_SERVER_ERROR'
}

function getStatusCode(errorName: string): number {
  const statusMap: Record<string, number> = {
    'UnauthorizedError': 401,
    'ForbiddenError': 403,
    'BadRequestError': 400,
    'NotFoundError': 404,
    'GoneError': 410,
    'ConflictError': 409,
    'ValidationError': 400,
    'RepositoryError': 500,
    'ServiceError': 500,
  }
  return statusMap[errorName] ?? 500
}

export function handleApiError(error: unknown): NextResponse {
  if (!(error instanceof Error)) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: '알 수 없는 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }

  const status = getStatusCode(error.name)
  const code = getErrorCode(error.name)
  const isClientError = status < 500

  const response: any = {
    success: false,
    code,
    message: isClientError ? error.message : '서버 오류가 발생했습니다',
  }

  // ValidationError의 details 추가
  if (isValidationError(error) && error.details) {
    response.details = error.details
  }

  // 개발 환경에서만 상세 로그
  if (process.env.NODE_ENV !== 'production') {
    console.error('[API_ERROR]', error.name, error.message)
    if ((error as any).cause) {
      console.error('[API_ERROR_CAUSE]', (error as any).cause)
    }
  }

  return NextResponse.json(response, { status })
}
