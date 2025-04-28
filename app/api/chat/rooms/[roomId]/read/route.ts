import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

interface RouteParams {
  params: {
    roomId: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const roomId = params.roomId
    
    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자' }, { status: 401 })
    }
    
    // 1. 채팅방 참가자 정보 업데이트
    const { error } = await supabase
      .from('chat_room_participants')
      .update({ unread_count: 0 })
      .eq('chat_room_id', roomId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('읽음 처리 오류:', error)
      return NextResponse.json({ error: '읽음 처리 실패' }, { status: 500 })
    }
    
    // 2. 해당 채팅방의 메시지 ID 목록 가져오기
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_room_id', roomId)
      .eq('receiver_id', user.id)
    
    if (messages && messages.length > 0) {
      const messageIds = messages.map(msg => msg.id)
      
      // 3. 관련 알림 읽음 처리
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
    const message = error instanceof Error ? error.message : '메시지 읽음 처리 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
