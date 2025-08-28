// app/api/notifications/mark-chat-read/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { createServerClientComponent } from '@/supabase/functions/server'

export async function POST(request: NextRequest) {
  try {
    const { chatRoomId } = await request.json()
    const supabase = await createServerClientComponent()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 채팅방 참여자 unread_count 초기화
    const { error: participantError } = await supabase
      .from('chat_room_participants')
      .update({ unread_count: 0 })
      .eq('chat_room_id', chatRoomId)
      .eq('user_id', user.id)

    if (participantError) {
      console.error('채팅방 참여자 unread_count 업데이트 실패:', participantError)
      return NextResponse.json(
        { error: 'Failed to update chat room participant' },
        { status: 500 }
      )
    }

    // 해당 채팅방의 메시지 ID 목록 가져오기 (수신자로서 받은 메시지만)
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_room_id', chatRoomId)
      .eq('receiver_id', user.id)

    if (messages && messages.length > 0) {
      const messageIds = messages.map(msg => msg.id)

      // 메시지 관련 알림 읽음 처리
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('type', 'message')
        .eq('is_read', false)
        .in('related_id', messageIds)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('채팅 알림 읽음 처리 API 에러:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
