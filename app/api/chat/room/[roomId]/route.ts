// app/api/chat/rooms/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'
import { ChatRoom } from '@/app/dashboard/chat/_types/chatTypes'
import { handleApiError, createUnauthorizedError, createForbiddenError, createNotFoundError, createServiceError, createValidationError } from '@/app/apis/base'
import { chatRoomParamsSchema } from '@/libs/schemas/server/chat.schema'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
): Promise<NextResponse> {
  try {
    const rawParams = await params
    const parsed = chatRoomParamsSchema.safeParse(rawParams)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 경로 파라미터가 유효하지 않습니다.', details)
    }
    const { roomId } = parsed.data
    
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
      throw createUnauthorizedError('인증 오류')
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
      if ((roomError as any).code === 'PGRST116') {
        throw createNotFoundError('채팅방을 찾을 수 없습니다')
      }
      throw createServiceError('채팅방 조회 실패', roomError)
    }
    
    // 권한 확인: 현재 사용자가 이 채팅방의 참가자인지 확인
    const isParticipant = roomData.chat_room_participants?.some(
      p => p.user_id === userId
    )
    
    if (!isParticipant) {
      throw createForbiddenError('해당 채팅방에 접근 권한이 없습니다')
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
    return handleApiError(error)
  }
}