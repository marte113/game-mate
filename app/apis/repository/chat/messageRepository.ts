import 'server-only'

import { getServerSupabase, wrapRepo } from '@/app/apis/base'
import { callRpc } from '@/app/apis/base'

export interface MessageRow {
  id: string
  chat_room_id: string
  sender_id: string
  content: string | null
  created_at: string
  // 필요한 경우 추가 필드
}

export async function fetchMessagesByRoom(roomId: string): Promise<MessageRow[]> {
  return wrapRepo('chat.fetchMessagesByRoom', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []) as MessageRow[]
  })
}

export async function markMessagesAsRead(roomId: string, userId: string) {
  return wrapRepo('chat.markMessagesAsRead', async () => {
    await callRpc('mark_messages_as_read', { p_chat_room_id: roomId, p_user_id: userId })
  })
}


