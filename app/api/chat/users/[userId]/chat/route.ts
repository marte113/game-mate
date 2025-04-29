import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'

interface RouteParams {
  params: {
    userId: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const userId = params.userId
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: '인증 오류' }, { status: 401 })
    }
    
    const currentUserId = userData.user.id
    
    // 사용자가 자신과 채팅하려는 경우
    if (userId === currentUserId) {
      return NextResponse.json({ error: '자신과는 대화할 수 없습니다' }, { status: 400 })
    }
    
    // 이미 존재하는 채팅방 찾기
    const { data: existingRooms } = await supabase
      .from('chat_room_participants')
      .select(`
        chat_room_id,
        chat_rooms!left(id)
      `)
      .eq('user_id', currentUserId)
    
    if (existingRooms && existingRooms.length > 0) {
      // 상대방이 같은 채팅방에 있는지 확인
      const chatRoomIds = existingRooms
        .filter(room => room.chat_room_id) // null이 아닌 값만 필터링
        .map(room => room.chat_room_id)
      
      if (chatRoomIds.length > 0) {
        const { data: otherUserRooms } = await supabase
          .from('chat_room_participants')
          .select('chat_room_id')
          .eq('user_id', userId)
          .in('chat_room_id', chatRoomIds)
        
        // 공통 채팅방이 있으면 해당 채팅방 ID 반환
        if (otherUserRooms && otherUserRooms.length > 0) {
          const roomId = otherUserRooms[0].chat_room_id
          return NextResponse.json({ chatRoomId: roomId })
        }
      }
    }
    
    // 기존 채팅방이 없으면 새 채팅방을 생성
    const { data: newRoom, error: createRoomError } = await supabase
      .from('chat_rooms')
      .insert({
        last_message: '대화가 시작되었습니다.',
        last_message_time: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createRoomError) {
      // RLS 오류 감지 및 특별 처리
      if (createRoomError.code === '42501') {
        return NextResponse.json({ 
          error: '권한 오류: 채팅방 생성 권한이 없습니다. 관리자에게 문의하세요.'
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: createRoomError.message }, { status: 500 })
    }
    
    // 참가자 추가
    const { error: participantsError } = await supabase
      .from('chat_room_participants')
      .insert([
        { chat_room_id: newRoom.id, user_id: currentUserId, unread_count: 0 },
        { chat_room_id: newRoom.id, user_id: userId, unread_count: 0 }
      ])
    
    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 })
    }
    
    // 첫 메시지 추가
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        content: '대화가 시작되었습니다.',
        sender_id: currentUserId,
        receiver_id: userId,
        chat_room_id: newRoom.id,
        is_read: false
      })
    
    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }
    
    return NextResponse.json({ chatRoomId: newRoom.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : '채팅방을 생성하는 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
