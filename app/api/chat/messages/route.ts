import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'
import { SendMessageRequest } from '@/app/dashboard/chat/_types/chatTypes'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // URL에서 roomId 파라미터 가져오기
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    
    if (!roomId) {
      return NextResponse.json({ error: '채팅방 ID가 필요합니다' }, { status: 400 })
    }
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: '인증 오류' }, { status: 401 })
    }
    
    // 메시지 가져오기
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }
    
    // 자동으로 읽음 처리
    const userId = userData.user.id
    await supabase.rpc('mark_messages_as_read', {
      p_chat_room_id: roomId,
      p_user_id: userId
    })
    
    return NextResponse.json({ messages: messagesData || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : '메시지를 가져오는 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // 요청 본문 파싱
    const requestData: SendMessageRequest = await request.json()
    const { content, receiverId, chatRoomId } = requestData
    
    if (!content || !receiverId) {
      return NextResponse.json({ error: '메시지 내용과 수신자 ID가 필요합니다' }, { status: 400 })
    }
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: '인증 오류' }, { status: 401 })
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
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: messageData[0],
      chatRoomId: messageData[0]?.chat_room_id
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '메시지 전송 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
