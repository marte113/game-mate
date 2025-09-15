"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

import { queryKeys } from "@/constants/queryKeys"
import { chatApi } from "@/app/dashboard/chat/_api/chatApi"
import type { Database } from "@/types/database.types"
import { useAuthStore } from "@/stores/authStore"

type MessageRow = Database["public"]["Tables"]["messages"]["Row"]

export interface SendMessageData {
  content: string
  receiverId: string
  // null은 허용하지 않고 undefined로 정규화하여 전달
  chatRoomId?: string
}

export interface CreateChatRoomData {
  userId: string
}

/**
 * 메시지 전송 뮤테이션 훅
 */
export function useSendMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ content, receiverId, chatRoomId }: SendMessageData) =>
      chatApi.sendMessage(content, receiverId, chatRoomId ?? undefined),
    onSuccess: () => {
      // 채팅방 목록과 메시지 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() })
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] }) // 모든 메시지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.chatRooms() }) // Legacy 호환
    },
    onError: (error: Error) => {
      toast.error(error.message || "메시지 전송에 실패했습니다")
    },
  })
}

/**
 * 읽음 처리 뮤테이션 훅
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => chatApi.markAsRead(roomId),
    onSuccess: () => {
      // 채팅방 목록 캐시 무효화 (읽지 않은 메시지 수 업데이트)
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() })
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.chatRooms() }) // Legacy 호환
    },
    onError: (error: Error) => {
      console.error("읽음 처리 실패:", error)
      // 읽음 처리는 사용자에게 에러 토스트를 보여주지 않음 (백그라운드 작업)
    },
  })
}

/**
 * 채팅방 생성/찾기 뮤테이션 훅
 */
export function useCreateChatRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId }: CreateChatRoomData) => chatApi.findOrCreateChatWithUser(userId),
    onSuccess: () => {
      // 채팅방 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() })
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.chatRooms() }) // Legacy 호환
    },
    onError: (error: Error) => {
      toast.error(error.message || "채팅방 생성에 실패했습니다")
    },
  })
}

/**
 * 낙관적 업데이트를 사용한 메시지 전송 훅
 * 즉시 UI에 메시지를 표시하고, 실패 시 롤백
 */
export function useOptimisticSendMessage() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ content, receiverId, chatRoomId }: SendMessageData) =>
      chatApi.sendMessage(content, receiverId, chatRoomId ?? undefined),
    onMutate: async ({ content, receiverId, chatRoomId }) => {
      // 방별 메시지 쿼리와 충돌 방지를 위해 현재 쿼리를 취소
      if (chatRoomId) {
        await queryClient.cancelQueries({ queryKey: queryKeys.chat.messages(chatRoomId) })
        const previous = queryClient.getQueryData<MessageRow[]>(queryKeys.chat.messages(chatRoomId))

        const optimisticId = `optimistic-${Date.now()}`
        const optimistic: MessageRow = {
          id: optimisticId as unknown as string,
          content,
          sender_id: (currentUserId ?? "optimistic-user") as string,
          receiver_id: receiverId,
          chat_room_id: chatRoomId,
          is_read: false,
          created_at: new Date().toISOString(),
        }

        queryClient.setQueryData<MessageRow[]>(queryKeys.chat.messages(chatRoomId), (old) => [
          ...(old ?? []),
          optimistic,
        ])

        return { previous, chatRoomId }
      }
      // chatRoomId가 없는 경우는 서버 응답을 기다린 뒤 목록 invalidate만
      return { previous: undefined, chatRoomId: undefined as unknown as string | undefined }
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.chatRoomId) {
        // 이전 캐시로 롤백
        queryClient.setQueryData(queryKeys.chat.messages(ctx.chatRoomId), ctx.previous ?? [])
      }
      toast.error(error.message || "메시지 전송에 실패했습니다")
    },
    onSettled: (_data, _err, variables, _ctx) => {
      const roomId = variables.chatRoomId
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(roomId) })
      }
      // 채팅방 목록/미리보기 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() })
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.chatRooms() })
    },
  })
}

// 간편한 별칭들 (기존 컴포넌트 호환성)
export const useSendMessage = useSendMessageMutation
export const useMarkAsRead = useMarkAsReadMutation
export const useCreateChatRoom = useCreateChatRoomMutation
