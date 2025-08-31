import { NextResponse } from 'next/server'
import { changeOrderStatus } from '@/app/apis/service/order/statusService'
import { handleApiError, createServiceError, createValidationError } from '@/app/apis/base'
import { changeOrderStatusBodySchema } from '@/libs/schemas/server/order.schema'

// PATCH: 의뢰 상태 변경
export async function PATCH(request: Request) {
  try {
    const json = await request.json()
    const parsed = changeOrderStatusBodySchema.safeParse(json)
    if (!parsed.success) {
      throw createValidationError('요청 바디가 유효하지 않습니다.', parsed.error.flatten().fieldErrors)
    }
    const result = await changeOrderStatus(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('의뢰 상태 변경 중 오류', error))
  }
}