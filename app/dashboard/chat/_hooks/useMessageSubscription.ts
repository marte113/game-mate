// app/dashboard/chat/_hooks/useMessageSubscription.ts
"use client"

import { useEffect } from "react"
import { createClient } from "@/supabase/functions/client"
import { useQueryClient } from "@tanstack/react-query"
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"
import type { Message } from "@/app/dashboard/chat/_types/chatTypes"
import { queryKeys } from "@/constants/queryKeys"
import { markChatNotificationsAsRead } from "@/app/actions/notification"

export const useMessageSubscription = (currentChatRoomId: string | null) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const subscription: RealtimeChannel = supabase
      .channel("public:messages")
      .on<Message>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          const { data: userData } = await supabase.auth.getUser()
          const userId = userData.user?.id

          const newMessage = payload.new as Message

          // 새 메시지의 채팅방과 현재 보고 있는 채팅방이 같은 경우
          if (currentChatRoomId && currentChatRoomId === newMessage.chat_room_id) {
            // 메시지 캐시 무효화 - 중앙 쿼리 키 사용
            queryClient.invalidateQueries({
              queryKey: queryKeys.chat.messages(currentChatRoomId),
            })

            // 새 메시지가 현재 사용자에게 온 경우 읽음 처리 + 알림 읽음 처리
            if (newMessage.receiver_id === userId) {
              try {
                await fetch(`/api/chat/rooms/${currentChatRoomId}/read`, { method: "POST" })
                // Server Action으로 알림 읽음 처리 + React Query 캐시 무효화
                await markChatNotificationsAsRead(currentChatRoomId)
                queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
              } catch (e) {
                // noop: 네트워크 일시 오류는 다음 이벤트 시 재시도됨
              }
            }
          } else {
            // 다른 채팅방에서 메시지가 왔을 경우 채팅방 목록만 업데이트
            queryClient.invalidateQueries({
              queryKey: queryKeys.chat.chatRooms(),
            })
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_room_participants",
        },
        () => {
          // 채팅방 참가자 정보가 업데이트되면 채팅방 목록을 다시 가져오기
          queryClient.invalidateQueries({ queryKey: queryKeys.chat.chatRooms() })
        },
      )
      .subscribe()

    // 구독 정리 함수
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentChatRoomId, queryClient])
}
