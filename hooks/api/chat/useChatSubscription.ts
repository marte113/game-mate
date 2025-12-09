"use client"

import { useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { createClient } from "@/supabase/functions/client"
import { queryKeys } from "@/constants/queryKeys"
import { useUser } from "@/stores/authStore"
import type { Database } from "@/types/database.types"

type MessageRow = Database["public"]["Tables"]["messages"]["Row"]

/**
 * 채팅 메시지 실시간 구독 훅
 */
export function useChatMessageSubscription(currentRoomId?: string | null) {
  const queryClient = useQueryClient()
  const user = useUser()

  const handleNewMessage = useCallback(
    async (payload: RealtimePostgresChangesPayload<MessageRow>) => {
      if (!user?.id) return

      const rawNew = payload.new
      // Supabase 타입은 event 타입에 따라 new가 {}일 수 있으므로 런타임 가드로 협소화
      if (!rawNew || typeof rawNew !== "object" || !("chat_room_id" in rawNew)) {
        return
      }
      const newMessage = rawNew as MessageRow
      const messageRoomId = newMessage.chat_room_id

      // 현재 보고 있는 채팅방의 메시지인 경우 메시지 목록 갱신
      if (currentRoomId && currentRoomId === messageRoomId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.messages(currentRoomId),
        })
      }

      // 항상 채팅방 목록 갱신 (last_message 업데이트 반영 - 발신자/수신자 모두)
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.rooms(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.chatRooms(),
      })
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
  const user = useUser()

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
  const user = useUser()

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
          const rawNew = payload.new
          if (!rawNew || typeof rawNew !== "object" || !("chat_room_id" in rawNew)) {
            return
          }
          const newMessage = rawNew as MessageRow
          const messageRoomId = newMessage.chat_room_id

          // 현재 채팅방의 메시지인 경우 메시지 목록 갱신
          if (currentRoomId && currentRoomId === messageRoomId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.chat.messages(currentRoomId),
            })
          }

          // 항상 채팅방 목록 갱신 (last_message 업데이트 반영 - 발신자/수신자 모두)
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.chatRooms(),
          })
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
