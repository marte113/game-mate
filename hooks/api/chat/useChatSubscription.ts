"use client"

import { useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { createClient } from "@/supabase/functions/client"
import { queryKeys } from "@/constants/queryKeys"
import { useAuthStore } from "@/stores/authStore"
import type { Database } from "@/types/database.types"

type MessageRow = Database["public"]["Tables"]["messages"]["Row"]

/**
 * 채팅 메시지 실시간 구독 훅
 */
export function useChatMessageSubscription(currentRoomId?: string | null) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const handleNewMessage = useCallback(
    async (payload: RealtimePostgresChangesPayload<MessageRow>) => {
      if (!user?.id) return

      const newMessage = payload.new
      const messageRoomId = newMessage.chat_room_id

      // 현재 보고 있는 채팅방의 메시지인 경우
      if (currentRoomId && currentRoomId === messageRoomId) {
        // 메시지 목록 무효화하여 새로고침
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.messages(currentRoomId),
        })

        // 받은 메시지인 경우 자동 읽음 처리 (별도 API 호출 필요)
        if (newMessage.receiver_id === user.id) {
          // 읽음 처리는 별도 mutation을 통해 처리하도록 함
        }
      } else {
        // 다른 채팅방의 메시지인 경우 채팅방 목록만 업데이트
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.rooms(),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.chatRooms(),
        })
      }
    },
    [queryClient, user?.id, currentRoomId],
  )

  useEffect(() => {
    if (!user?.id) return

    const supabase = createClient()

    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        handleNewMessage,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user?.id, handleNewMessage])
}

/**
 * 채팅방 변경사항 실시간 구독 훅
 */
export function useChatRoomSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.id) return

    const supabase = createClient()

    const subscription = supabase
      .channel("public:chat_rooms")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE 모두 감지
          schema: "public",
          table: "chat_rooms",
        },
        () => {
          // 채팅방 목록 무효화
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.rooms(),
          })
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.chatRooms(),
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [queryClient, user?.id])
}

/**
 * 통합 채팅 구독 훅 - 메시지와 채팅방 변경사항을 모두 구독
 */
export function useChatSubscriptions(currentRoomId?: string | null) {
  useChatMessageSubscription(currentRoomId)
  useChatRoomSubscription()
}

/**
 * Legacy 호환용 구독 훅 - 기존 chatStore의 subscribeToMessages와 유사한 동작
 */
export function useLegacyChatSubscription(currentRoomId?: string | null) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.id) return

    const supabase = createClient()

    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          const newMessage = payload.new
          const messageRoomId = newMessage.chat_room_id

          if (currentRoomId && currentRoomId === messageRoomId) {
            // 현재 채팅방의 메시지 목록 새로고침
            queryClient.invalidateQueries({
              queryKey: queryKeys.chat.messages(currentRoomId),
            })

            // 받은 메시지인 경우 읽음 처리 (기존 로직 유지)
            if (newMessage.receiver_id === user.id) {
              // 읽음 처리는 컴포넌트에서 별도로 처리하도록 함
            }
          } else {
            // 다른 채팅방의 메시지인 경우 채팅방 목록 업데이트
            queryClient.invalidateQueries({
              queryKey: queryKeys.chat.chatRooms(),
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [queryClient, user?.id, currentRoomId])

  // cleanup 함수 반환 (기존 chatStore와 호환성 유지)
  return useCallback(() => {
    // 실제 cleanup은 useEffect의 cleanup에서 처리됨
  }, [])
}
