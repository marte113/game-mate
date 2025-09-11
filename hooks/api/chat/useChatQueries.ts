"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { chatApi } from "@/app/dashboard/chat/_api/chatApi"
import type { ChatRoom, Message } from "@/app/dashboard/chat/_types/chatTypes"

export interface ChatRoomListResponse {
  chatRooms: ChatRoom[]
}

export interface MessagesResponse {
  messages: Message[]
}

/**
 * 채팅방 목록을 조회하는 훅
 */
export function useChatRoomsQuery(
  options?: UseQueryOptions<ChatRoom[], Error, ChatRoom[], ReturnType<typeof queryKeys.chat.rooms>>,
) {
  return useQuery({
    queryKey: queryKeys.chat.rooms(),
    queryFn: chatApi.getChatRooms,
    staleTime: 30_000, // 30초 - 채팅방 목록은 실시간으로 업데이트되므로 짧게 설정
    gcTime: 300_000, // 5분
    throwOnError: true,
    ...options,
  })
}

/**
 * 특정 채팅방의 메시지를 조회하는 훅
 */
export function useChatMessagesQuery(
  roomId: string,
  options?: UseQueryOptions<
    Message[],
    Error,
    Message[],
    ReturnType<typeof queryKeys.chat.messages>
  >,
) {
  return useQuery({
    queryKey: queryKeys.chat.messages(roomId),
    queryFn: () => chatApi.getMessages(roomId),
    staleTime: 600_000, // 10분 - 이미 전송된 메시지는 변하지 않음
    gcTime: 1800_000, // 30분
    enabled: !!roomId,
    throwOnError: true,
    ...options,
  })
}

/**
 * 특정 채팅방 정보를 조회하는 훅
 */
export function useChatRoomQuery(
  roomId: string,
  options?: UseQueryOptions<ChatRoom, Error, ChatRoom, ReturnType<typeof queryKeys.chat.room>>,
) {
  return useQuery({
    queryKey: queryKeys.chat.room(roomId),
    queryFn: () => chatApi.getChatRoom(roomId),
    staleTime: 300_000, // 5분 - 채팅방 정보는 상대적으로 덜 변함
    gcTime: 600_000, // 10분
    enabled: !!roomId,
    throwOnError: true,
    ...options,
  })
}

/**
 * Legacy 호환용 - 기존 컴포넌트와의 호환성을 위해 유지
 */
export function useChatRoomsLegacyQuery(
  options?: UseQueryOptions<
    ChatRoom[],
    Error,
    ChatRoom[],
    ReturnType<typeof queryKeys.chat.chatRooms>
  >,
) {
  return useQuery({
    queryKey: queryKeys.chat.chatRooms(),
    queryFn: chatApi.getChatRooms,
    staleTime: 30_000,
    gcTime: 300_000,
    throwOnError: true,
    ...options,
  })
}

// 간편한 별칭들 (기존 컴포넌트 호환성)
export const useChatMessages = useChatMessagesQuery
export const useChatRoom = useChatRoomQuery
