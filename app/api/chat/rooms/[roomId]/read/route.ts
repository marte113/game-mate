import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'
import { handleApiError, createUnauthorizedError, createServiceError, createValidationError } from '@/app/apis/base'
import { chatRoomParamsSchema } from '@/libs/schemas/server/chat.schema'

interface RouteParams {
  params: Promise<{ roomId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
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
    const rawParams = await params
    const parsed = chatRoomParamsSchema.safeParse(rawParams)
    if (!parsed.success) {
      throw createValidationError('잘못된 경로 파라미터', parsed.error.flatten().fieldErrors)
    }
    const { roomId } = parsed.data
    
    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw createUnauthorizedError('인증되지 않은 사용자')
    }
    
    // 1. 채팅방 참가자 정보 업데이트
    const { error } = await supabase
      .from('chat_room_participants')
      .update({ unread_count: 0 })
      .eq('chat_room_id', roomId)
      .eq('user_id', user.id)
    
    if (error) {
      throw createServiceError('읽음 처리 실패', error)
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
    return handleApiError(error)
  }
}
