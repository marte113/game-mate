// app/api/order/provider-reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getMyProviderReservations } from '@/app/apis/service/order/providerReservationsService'
import { handleApiError, createServiceError, createValidationError } from '@/app/apis/base'
import { providerReservationsGetQuerySchema } from '@/libs/schemas/server/order.schema'

export async function GET(request: NextRequest) {
  try {
    const rawQuery = { providerId: request.nextUrl.searchParams.get('providerId') ?? undefined }
    const parsed = providerReservationsGetQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      throw createValidationError('쿼리 파라미터가 유효하지 않습니다.', parsed.error.flatten().fieldErrors)
    }
    const { providerId } = parsed.data
    const result = await getMyProviderReservations(providerId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('예약 정보 조회 오류', error))
  }
}