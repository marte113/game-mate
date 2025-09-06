"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

import { queryKeys } from "@/constants/queryKeys"
import { chatApi } from "@/app/dashboard/chat/_api/chatApi"
import type { Database } from "@/types/database.types"

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

  return useMutation({
    mutationFn: async ({ content, receiverId, chatRoomId }: SendMessageData) => {
      // 낙관적 업데이트: 즉시 메시지를 캐시에 추가
      if (chatRoomId) {
        queryClient.setQueryData<MessageRow[]>(
          queryKeys.chat.messages(chatRoomId),
          (oldMessages: MessageRow[] | undefined = []) => [
            ...oldMessages,
            {
              id: `temp-${Date.now()}`, // 임시 ID
              content,
              sender_id: "current-user", // 현재 사용자 ID로 교체 필요
              receiver_id: receiverId,
              chat_room_id: chatRoomId,
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ],
        )
      }

      // 실제 API 호출
      await chatApi.sendMessage(content, receiverId, chatRoomId ?? undefined)
    },
    onSuccess: (_, { chatRoomId }) => {
      // 성공 시 정확한 데이터로 다시 불러오기
      if (chatRoomId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(chatRoomId) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() })
    },
    onError: (error: Error, { chatRoomId }) => {
      // 실패 시 낙관적 업데이트 롤백
      if (chatRoomId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(chatRoomId) })
      }
      toast.error(error.message || "메시지 전송에 실패했습니다")
    },
  })
}

// 간편한 별칭들 (기존 컴포넌트 호환성)
export const useSendMessage = useSendMessageMutation
export const useMarkAsRead = useMarkAsReadMutation
export const useCreateChatRoom = useCreateChatRoomMutation
