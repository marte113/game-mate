// app/api/order/provider-reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getMyProviderReservations } from '@/app/apis/service/order/providerReservationsService'

export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get('providerId') ?? undefined
    const result = await getMyProviderReservations(providerId ?? undefined)
    return NextResponse.json(result)
  } catch (error) {
    console.error('예약 정보 조회 오류:', error)
    return NextResponse.json(
      { error: '예약 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}