import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getMyRequestedOrders } from '@/app/apis/service/order/requestedService'
import { handleApiError, createServiceError } from '@/app/apis/base'

// GET: 사용자가 신청한 의뢰 목록 조회 (리뷰 작성 여부 포함)
export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status') ?? undefined
    const result = await getMyRequestedOrders({ status: statusParam ?? undefined })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('신청한 의뢰 목록 조회 오류', error))
  }
}