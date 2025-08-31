import { NextRequest, NextResponse } from 'next/server'
import { getMyReceivedOrders } from '@/app/apis/service/order/receivedService'
import { handleApiError, createServiceError, createValidationError } from '@/app/apis/base'
import { orderListQuerySchema } from '@/libs/schemas/server/order.schema'

// GET: 사용자가 받은 의뢰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const rawQuery = { status: request.nextUrl.searchParams.get('status') ?? undefined }
    const parsed = orderListQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      throw createValidationError('쿼리 파라미터가 유효하지 않습니다.', parsed.error.flatten().fieldErrors)
    }
    const { status } = parsed.data
    const result = await getMyReceivedOrders({ status })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('의뢰 목록 조회 오류', error))
  }
}