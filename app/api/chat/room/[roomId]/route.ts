// app/api/chat/rooms/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'
import { ChatRoom } from '@/app/dashboard/chat/_types/chatTypes'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
): Promise<NextResponse> {
  try {
    const { roomId } = await params
    
    if (!roomId) {
      return NextResponse.json(
        { error: '채팅방 ID가 필요합니다' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: '인증 오류' }, { status: 401 })
    }
    
    const userId = userData.user.id
    
    // 특정 채팅방 정보 가져오기
    const { data: roomData, error: roomError } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        last_message,
        last_message_time,
        chat_room_participants!left(id, chat_room_id, user_id, unread_count, created_at, updated_at)
      `)
      .eq('id', roomId)
      .single()
    
    if (roomError) {
      return NextResponse.json(
        { error: roomError.message },
        { status: roomError.code === 'PGRST116' ? 404 : 500 }
      )
    }
    
    // 권한 확인: 현재 사용자가 이 채팅방의 참가자인지 확인
    const isParticipant = roomData.chat_room_participants?.some(
      p => p.user_id === userId
    )
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: '해당 채팅방에 접근 권한이 없습니다' },
        { status: 403 }
      )
    }
    
    // 현재 사용자가 아닌 다른 참가자 찾기
    const otherParticipant = roomData.chat_room_participants
      ?.find(p => p.user_id !== userId)
    
    const otherParticipantId = otherParticipant?.user_id
    
    let otherUserData = null
    if (otherParticipantId) {
      // 다른 참가자 정보 가져오기
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, profile_circle_img, is_online')
        .eq('id', otherParticipantId)
        .single()
      
      otherUserData = userData
    }
    
    const chatRoom: ChatRoom = {
      id: roomData.id,
      last_message: roomData.last_message,
      last_message_time: roomData.last_message_time,
      participants: roomData.chat_room_participants || [],
      otherUser: otherUserData
    }
    
    return NextResponse.json(chatRoom)
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : '채팅방 정보를 가져오는 중 오류가 발생했습니다'
    
    return NextResponse.json({ error: message }, { status: 500 })
  }
}