"use server"

import {
  getChatRoomsByUserId,
  getMessagesByChatRoomId,
  createMessage,
  markMessagesAsRead,
  findChatRoomBetweenUsers,
  createChatRoom,
  getChatRoomById,
  type ChatRoomDetail,
} from "@/app/apis/repository/chat/chatRepository"
import {
  createUnauthorizedError,
  createNotFoundError,
  createServiceError,
} from "@/app/apis/base/errors"
import { createClient } from "@/supabase/functions/server"
import type { Database } from "@/types/database.types"
type MessageRow = Database["public"]["Tables"]["messages"]["Row"]

export interface ChatRoomListResponse {
  chatRooms: ChatRoomDetail[]
}

export interface MessagesResponse {
  messages: MessageRow[]
}

export interface SendMessageRequest {
  content: string
  receiverId: string
  chatRoomId?: string | null
}

export interface CreateChatRoomRequest {
  userId: string
}

/**
 * 현재 인증된 사용자 ID를 가져옵니다
 */
async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw createUnauthorizedError("인증 오류가 발생했습니다")
  }

  if (!user) {
    throw createUnauthorizedError("로그인이 필요합니다")
  }

  return user.id
}

/**
 * 사용자의 채팅방 목록을 조회합니다
 */
export async function getChatRoomsService(): Promise<ChatRoomListResponse> {
  try {
    const userId = await getCurrentUserId()
    const chatRooms = await getChatRoomsByUserId(userId)

    return { chatRooms }
  } catch (error) {
    if (error instanceof Error && error.name.includes("Error")) {
      throw error // 이미 처리된 에러는 그대로 전달
    }
    throw createServiceError("채팅방 목록을 가져오는 중 오류가 발생했습니다")
  }
}

/**
 * 특정 채팅방의 메시지를 조회합니다
 */
export async function getMessagesService(roomId: string): Promise<MessagesResponse> {
  try {
    const userId = await getCurrentUserId()

    // 사용자가 해당 채팅방에 접근 권한이 있는지 확인
    const chatRoom = await getChatRoomById(roomId, userId)
    if (!chatRoom) {
      throw createNotFoundError("채팅방을 찾을 수 없습니다")
    }

    // 사용자가 참가자인지 확인
    const isParticipant = chatRoom.participants.some((p) => p.user_id === userId)
    if (!isParticipant) {
      throw createUnauthorizedError("해당 채팅방에 접근할 권한이 없습니다")
    }

    const messages = await getMessagesByChatRoomId(roomId)

    // 메시지 조회 후 자동으로 읽음 처리
    await markMessagesAsRead(roomId, userId)

    return { messages }
  } catch (error) {
    if (error instanceof Error && error.name.includes("Error")) {
      throw error
    }
    throw createServiceError("메시지를 가져오는 중 오류가 발생했습니다")
  }
}

/**
 * 메시지를 전송합니다
 */
export async function sendMessageService(
  request: SendMessageRequest,
): Promise<{ success: boolean }> {
  try {
    const { content, receiverId, chatRoomId } = request
    const senderId = await getCurrentUserId()

    // 입력 검증
    if (!content?.trim()) {
      throw createServiceError("메시지 내용을 입력해주세요")
    }

    if (!receiverId) {
      throw createServiceError("수신자 정보가 필요합니다")
    }

    // 자기 자신에게 메시지 전송 방지
    if (senderId === receiverId) {
      throw createServiceError("자기 자신에게는 메시지를 보낼 수 없습니다")
    }

    // 메시지 생성
    const message = await createMessage(content.trim(), senderId, receiverId, chatRoomId)

    // 채팅방 정보 업데이트 (last_message, last_message_time)
    if (message.chat_room_id) {
      const supabase = await createClient()
      await supabase
        .from("chat_rooms")
        .update({
          last_message: content.trim(),
          last_message_time: new Date().toISOString(),
        })
        .eq("id", message.chat_room_id)
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.name.includes("Error")) {
      throw error
    }
    throw createServiceError("메시지 전송 중 오류가 발생했습니다")
  }
}

/**
 * 채팅방의 메시지를 읽음 처리합니다
 */
export async function markAsReadService(roomId: string): Promise<{ success: boolean }> {
  try {
    const userId = await getCurrentUserId()

    // 사용자가 해당 채팅방에 접근 권한이 있는지 확인
    const chatRoom = await getChatRoomById(roomId, userId)
    if (!chatRoom) {
      throw createNotFoundError("채팅방을 찾을 수 없습니다")
    }

    const isParticipant = chatRoom.participants.some((p) => p.user_id === userId)
    if (!isParticipant) {
      throw createUnauthorizedError("해당 채팅방에 접근할 권한이 없습니다")
    }

    await markMessagesAsRead(roomId, userId)

    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.name.includes("Error")) {
      throw error
    }
    throw createServiceError("읽음 처리 중 오류가 발생했습니다")
  }
}

/**
 * 특정 사용자와의 채팅방을 찾거나 생성합니다
 */
export async function findOrCreateChatWithUserService(
  request: CreateChatRoomRequest,
): Promise<{ chatRoomId: string }> {
  try {
    const { userId: targetUserId } = request
    const currentUserId = await getCurrentUserId()

    // 입력 검증
    if (!targetUserId) {
      throw createServiceError("대화할 사용자 정보가 필요합니다")
    }

    // 자기 자신과 채팅방 생성 방지
    if (currentUserId === targetUserId) {
      throw createServiceError("자기 자신과는 채팅할 수 없습니다")
    }

    // 대상 사용자 존재 확인
    const supabase = await createClient()
    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", targetUserId)
      .single()

    if (userError || !targetUser) {
      throw createNotFoundError("사용자를 찾을 수 없습니다")
    }

    // 기존 채팅방 찾기
    const existingRoomId = await findChatRoomBetweenUsers(currentUserId, targetUserId)

    if (existingRoomId) {
      return { chatRoomId: existingRoomId }
    }

    // 새 채팅방 생성
    const newRoomId = await createChatRoom(currentUserId, targetUserId)

    return { chatRoomId: newRoomId }
  } catch (error) {
    if (error instanceof Error && error.name.includes("Error")) {
      throw error
    }
    throw createServiceError("채팅방 생성 중 오류가 발생했습니다")
  }
}

/**
 * 특정 채팅방 정보를 조회합니다
 */
export async function getChatRoomService(roomId: string): Promise<ChatRoomDetail> {
  try {
    const userId = await getCurrentUserId()

    if (!roomId) {
      throw createServiceError("채팅방 ID가 필요합니다")
    }

    const chatRoom = await getChatRoomById(roomId, userId)

    if (!chatRoom) {
      throw createNotFoundError("채팅방을 찾을 수 없습니다")
    }

    // 사용자가 참가자인지 확인
    const isParticipant = chatRoom.participants.some((p) => p.user_id === userId)
    if (!isParticipant) {
      throw createUnauthorizedError("해당 채팅방에 접근할 권한이 없습니다")
    }

    return chatRoom
  } catch (error) {
    if (error instanceof Error && error.name.includes("Error")) {
      throw error
    }
    throw createServiceError("채팅방 정보를 가져오는 중 오류가 발생했습니다")
  }
}
