import { NextRequest, NextResponse } from 'next/server'
import { getMessagesAndMarkRead, createOrderWithPayment } from '@/app/apis/service/order/verifyService'
import { toErrorResponse, BadRequestError } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  try {
    const roomId = request.nextUrl.searchParams.get('roomId')
    if (!roomId) throw new BadRequestError('채팅방 ID가 필요합니다')
    const result = await getMessagesAndMarkRead(roomId)
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, game, scheduledDate, scheduledTime, price } = body ?? {}
    if (!providerId || !game || !scheduledDate || !scheduledTime || typeof price !== 'number') {
      throw new BadRequestError('필수 정보가 누락되었습니다.')
    }
    const result = await createOrderWithPayment({ providerId, game, scheduledDate, scheduledTime, price })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}



