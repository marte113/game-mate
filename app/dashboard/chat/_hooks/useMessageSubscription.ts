// app/dashboard/chat/_hooks/useMessageSubscription.ts
'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

import { Database } from '@/types/database.types'
import { Message } from '@/app/dashboard/chat/_types/chatTypes'
import { ChatQueryKeys } from '@/app/dashboard/chat/_api'

export const useMessageSubscription = (currentChatRoomId: string | null) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const supabase = createClientComponentClient<Database>()
    
    const subscription: RealtimeChannel = supabase
      .channel('public:messages')
      .on<Message>(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          const { data: userData } = await supabase.auth.getUser()
          const userId = userData.user?.id
          
          // payload.new를 Message 타입으로 캐스팅하여 안전하게 접근
          const newMessage = payload.new as Message
          
          // 새 메시지의 채팅방과 현재 보고 있는 채팅방이 같은 경우
          if (currentChatRoomId && currentChatRoomId === newMessage.chat_room_id) {
            // 메시지 캐시 무효화 - React Query v4 형식으로 수정
            queryClient.invalidateQueries({
              queryKey: ['messages', currentChatRoomId]
            })
            
            // 새 메시지가 현재 사용자에게 온 경우 읽음 처리
            if (newMessage.receiver_id === userId) {
              const response = await fetch(`/api/chat/rooms/${currentChatRoomId}/read`, {
                method: 'POST'
              })
            }
          } else {
            // 다른 채팅방에서 메시지가 왔을 경우 채팅방 목록만 업데이트
            queryClient.invalidateQueries({
              queryKey: ['chatRooms']
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_room_participants'
        },
        (payload) => {
          // 채팅방 참가자 정보가 업데이트되면 채팅방 목록을 다시 가져오기
          queryClient.invalidateQueries({ queryKey: ChatQueryKeys.chatRooms })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'notifications'
        },
        (payload) => {
          // 알림 테이블 업데이트 시 알림 상태 갱신
          queryClient.invalidateQueries({ 
            queryKey: ['notifications'] 
          })
        }
      )
      .subscribe()
    
    // 구독 정리 함수
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentChatRoomId, queryClient])
}