import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'
import { SendMessageRequest } from '@/app/dashboard/chat/_types/chatTypes'
import { toErrorResponse, BadRequestError, UnauthorizedError, ServiceError } from '@/app/apis/base'

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
    
    // URL에서 roomId 파라미터 가져오기
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    
    if (!roomId) {
      throw new BadRequestError('채팅방 ID가 필요합니다')
    }
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new UnauthorizedError('인증 오류')
    }
    
    // 메시지 가져오기
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      throw new ServiceError('메시지 조회 실패', messagesError)
    }
    
    // 자동으로 읽음 처리
    const userId = userData.user.id
    await supabase.rpc('mark_messages_as_read', {
      p_chat_room_id: roomId,
      p_user_id: userId
    })
    
    return NextResponse.json({ messages: messagesData || [] })
  } catch (error) {
    return toErrorResponse(error)
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
    
    // 요청 본문 파싱
    const requestData: SendMessageRequest = await request.json()
    const { content, receiverId, chatRoomId } = requestData
    
    if (!content || !receiverId) {
      throw new BadRequestError('메시지 내용과 수신자 ID가 필요합니다')
    }
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new UnauthorizedError('인증 오류')
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
      throw new ServiceError('메시지 전송 실패', messageError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: messageData[0],
      chatRoomId: messageData[0]?.chat_room_id
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
