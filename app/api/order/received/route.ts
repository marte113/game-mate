import { NextRequest, NextResponse } from 'next/server'
import { getMyReceivedOrders } from '@/app/apis/service/order/receivedService'

// GET: 사용자가 받은 의뢰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status') ?? undefined
    const result = await getMyReceivedOrders({ status: statusParam })
    return NextResponse.json(result)
  } catch (error) {
    console.error('의뢰 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '의뢰 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}