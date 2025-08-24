import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { fetchMessagesByRoom, markMessagesAsRead } from '@/app/apis/repository/chat/messageRepository'
import { callRpc } from '@/app/apis/base'

export async function getMessagesAndMarkRead(roomId: string) {
  return wrapService('order.getMessagesAndMarkRead', async () => {
    const userId = await getCurrentUserId()
    if (!roomId) throw new Error('채팅방 ID가 필요합니다')
    const messages = await fetchMessagesByRoom(roomId)
    await markMessagesAsRead(roomId, userId)
    return { messages }
  })
}

type CreateOrderPayload = {
  providerId: string
  game: string
  scheduledDate: string
  scheduledTime: string
  price: number
}

export async function createOrderWithPayment(payload: CreateOrderPayload) {
  return wrapService('order.createOrderWithPayment', async () => {
    const requesterId = await getCurrentUserId()
    if (!payload.providerId || !payload.game || !payload.scheduledDate || !payload.scheduledTime || typeof payload.price !== 'number') {
      throw new Error('필수 정보가 누락되었습니다.')
    }
    const order = await callRpc('create_order_with_payment', {
      p_requester_id: requesterId,
      p_provider_id: payload.providerId,
      p_game: payload.game,
      p_scheduled_date: payload.scheduledDate,
      p_scheduled_time: payload.scheduledTime,
      p_price: payload.price,
    })
    return { order }
  })
}


