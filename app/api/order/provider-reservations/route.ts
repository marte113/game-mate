// app/api/order/provider-reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getMyProviderReservations } from '@/app/apis/service/order/providerReservationsService'
import { handleApiError, createServiceError } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get('providerId') ?? undefined
    const result = await getMyProviderReservations(providerId ?? undefined)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(createServiceError('예약 정보 조회 오류', error))
  }
}