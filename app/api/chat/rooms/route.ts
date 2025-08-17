// app/api/chat/rooms/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'
import { ChatRoom, ChatRoomsResponse } from '@/app/dashboard/chat/_types/chatTypes'

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: '인증 오류' }, { status: 401 })
    }
    
    const userId = userData.user.id
    
    // 채팅방과 참가자 정보 가져오기
    const { data: roomsData, error: roomsError } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        last_message,
        last_message_time,
        chat_room_participants!left(id, chat_room_id, user_id, unread_count, created_at, updated_at)
      `)
      .order('last_message_time', { ascending: false })
    
    if (roomsError) {
      return NextResponse.json({ error: roomsError.message }, { status: 500 })
    }
    
    // 각 채팅방의 다른 참가자 정보 가져오기
    const chatRooms: ChatRoom[] = await Promise.all(
      roomsData.map(async (room) => {
        // 현재 사용자가 아닌 다른 참가자 찾기
        const participant = room.chat_room_participants
          ?.find(p => p.user_id !== userId)
        
        const otherParticipantId = participant?.user_id
        
        if (!otherParticipantId) return { 
          id: room.id,
          last_message: room.last_message,
          last_message_time: room.last_message_time,
          participants: room.chat_room_participants || [],
          otherUser: null 
        }
        
        // 다른 참가자 정보 가져오기
        const { data: otherUserData } = await supabase
          .from('users')
          .select('id, name, profile_circle_img, is_online')
          .eq('id', otherParticipantId)
          .single()
        
        return {
          id: room.id,
          last_message: room.last_message,
          last_message_time: room.last_message_time,
          participants: room.chat_room_participants || [],
          otherUser: otherUserData
        }
      })
    )
    
    // 응답에 명시적으로 ChatRoomsResponse 형태로 변환
    const response: ChatRoomsResponse = { chatRooms }
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : '채팅방 목록을 가져오는 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}