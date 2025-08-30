import { NextResponse } from 'next/server'
import { refundTokens } from '@/app/apis/service/tasks/refundService'
import { handleApiError, createServiceError } from '@/app/apis/base'

export async function POST(request: Request) {
  try {
    const { requestId, amount } = await request.json()
    const result = await refundTokens({ requestId, amount })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('토큰 반환 중 오류 발생', error))
  }
}