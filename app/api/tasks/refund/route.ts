import { NextResponse } from 'next/server'
import { refundTokens } from '@/app/apis/service/tasks/refundService'
import { handleApiError, createServiceError, createValidationError } from '@/app/apis/base'
import { refundTokensPostBodySchema } from '@/libs/schemas/server/tasks.schema'

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = refundTokensPostBodySchema.safeParse(json)
    if (!parsed.success) {
      throw createValidationError('요청 바디가 유효하지 않습니다.', parsed.error.flatten().fieldErrors)
    }
    const result = await refundTokens(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('토큰 반환 중 오류 발생', error))
  }
}