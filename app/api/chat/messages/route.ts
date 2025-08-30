import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'
import { handleApiError, createUnauthorizedError, createServiceError, createValidationError } from '@/app/apis/base'
import { chatMessagesGetQuerySchema, sendMessageBodySchema } from '@/libs/schemas/server/messages.schema'

export async function GET(request: Request) {
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
    
    // URL에서 roomId 파라미터 검증
    const rawQuery = Object.fromEntries(new URL(request.url).searchParams)
    const parsed = chatMessagesGetQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
    }
    const { roomId } = parsed.data
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw createUnauthorizedError('인증 오류')
    }
    
    // 메시지 가져오기
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      throw createServiceError('메시지 조회 실패', messagesError)
    }
    
    // 자동으로 읽음 처리
    const userId = userData.user.id
    await supabase.rpc('mark_messages_as_read', {
      p_chat_room_id: roomId,
      p_user_id: userId
    })
    
    return NextResponse.json({ messages: messagesData || [] })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
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
    
    // 요청 본문 검증
    const body = await request.json().catch(() => undefined)
    const parsed = sendMessageBodySchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 본문이 유효하지 않습니다.', details)
    }
    const { content, receiverId, chatRoomId } = parsed.data
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw createUnauthorizedError('인증 오류')
    }
    
    const senderId = userData.user.id
    
    // 메시지 전송
    const insertData = {
      content,
      sender_id: senderId,
      receiver_id: receiverId,
      is_read: false,
      ...(chatRoomId && { chat_room_id: chatRoomId })
    }
    
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert(insertData)
      .select()
    
    if (messageError) {
      throw createServiceError('메시지 전송 실패', messageError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: messageData[0],
      chatRoomId: messageData[0]?.chat_room_id
    })
  } catch (error) {
    return handleApiError(error)
  }
}
