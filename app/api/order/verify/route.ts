import { NextRequest, NextResponse } from 'next/server'
import { getMessagesAndMarkRead, createOrderWithPayment } from '@/app/apis/service/order/verifyService'

export async function GET(request: NextRequest) {
  try {
    const roomId = request.nextUrl.searchParams.get('roomId')
    if (!roomId) return NextResponse.json({ error: '채팅방 ID가 필요합니다' }, { status: 400 })
    const result = await getMessagesAndMarkRead(roomId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '메시지를 가져오는 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, game, scheduledDate, scheduledTime, price } = body ?? {}
    const result = await createOrderWithPayment({ providerId, game, scheduledDate, scheduledTime, price })
    return NextResponse.json(result)
  } catch (error) {
    console.error('의뢰 생성 오류:', error)
    return NextResponse.json(
      { error: '의뢰 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}



