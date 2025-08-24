import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getMyRequestedOrders } from '@/app/apis/service/order/requestedService'

// GET: 사용자가 신청한 의뢰 목록 조회 (리뷰 작성 여부 포함)
export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status') ?? undefined
    const result = await getMyRequestedOrders({ status: statusParam ?? undefined })
    return NextResponse.json(result)
  } catch (error) {
    console.error('신청한 의뢰 목록 조회 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류 발생'
    return NextResponse.json(
      { error: '의뢰 목록을 가져오는데 실패했습니다: ' + message },
      { status: 500 }
    )
  }
}