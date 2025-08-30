import { NextRequest, NextResponse } from 'next/server'
import { getMyReceivedOrders } from '@/app/apis/service/order/receivedService'
import { handleApiError, createServiceError } from '@/app/apis/base'

// GET: 사용자가 받은 의뢰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status') ?? undefined
    const result = await getMyReceivedOrders({ status: statusParam })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('의뢰 목록 조회 오류', error))
  }
}