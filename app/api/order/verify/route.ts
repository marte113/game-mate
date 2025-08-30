import { NextRequest, NextResponse } from 'next/server'
import { getMessagesAndMarkRead, createOrderWithPayment } from '@/app/apis/service/order/verifyService'
import { handleApiError, createBadRequestError } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  try {
    const roomId = request.nextUrl.searchParams.get('roomId')
    if (!roomId) throw createBadRequestError('채팅방 ID가 필요합니다')
    const result = await getMessagesAndMarkRead(roomId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, game, scheduledDate, scheduledTime, price } = body ?? {}
    if (!providerId || !game || !scheduledDate || !scheduledTime || typeof price !== 'number') {
      throw createBadRequestError('필수 정보가 누락되었습니다.')
    }
    const result = await createOrderWithPayment({ providerId, game, scheduledDate, scheduledTime, price })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}



