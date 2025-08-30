import { NextResponse } from 'next/server'
import { changeOrderStatus } from '@/app/apis/service/order/statusService'
import { handleApiError, createServiceError } from '@/app/apis/base'

// PATCH: 의뢰 상태 변경
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const result = await changeOrderStatus(body)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('의뢰 상태 변경 중 오류', error))
  }
}