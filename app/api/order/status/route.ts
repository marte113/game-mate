import { NextResponse } from 'next/server'
import { changeOrderStatus } from '@/app/apis/service/order/statusService'

// PATCH: 의뢰 상태 변경
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const result = await changeOrderStatus(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API /api/order/status] Error processing PATCH request:`, error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생'
    return NextResponse.json(
      { error: '의뢰 상태 변경 중 예기치 않은 오류가 발생했습니다: ' + errorMessage },
      { status: 500 }
    )
  }
} 