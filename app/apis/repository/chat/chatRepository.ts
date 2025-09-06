"use server"

import { createClient } from "@/supabase/functions/server"
import type { Database } from "@/types/database.types"

type Tables = Database["public"]["Tables"]
type ChatRoomRow = Tables["chat_rooms"]["Row"]
type ChatRoomParticipantRow = Tables["chat_room_participants"]["Row"]
type MessageRow = Tables["messages"]["Row"]
// Supabase join 결과에 대한 명시적 타입(경고 해결용)
type RoomWithParticipants = ChatRoomRow & { chat_room_participants: ChatRoomParticipantRow[] }

export interface ChatRoomWithParticipants extends ChatRoomRow {
  chat_room_participants: ChatRoomParticipantRow[]
}

export interface ChatRoomDetail extends ChatRoomRow {
  participants: ChatRoomParticipantRow[]
  otherUser: {
    id: string
    name: string
    profile_circle_img: string | null
    is_online: boolean | null
  } | null
}

export interface MessageWithRoom extends MessageRow {
  chat_room_id: string
}

/**
 * 사용자의 채팅방 목록을 조회합니다
 */
export async function getChatRoomsByUserId(userId: string): Promise<ChatRoomDetail[]> {
  const supabase = await createClient()

  // 1. 사용자가 참여한 채팅방 목록 조회
  const { data: roomsData, error: roomsError } = await supabase
    .from("chat_rooms")
    .select(
      `
      id,
      last_message,
      last_message_time,
      created_at,
      updated_at,
      chat_room_participants!inner(
        id,
        chat_room_id,
        user_id,
        unread_count,
        created_at,
        updated_at
      )
    `,
    )
    .eq("chat_room_participants.user_id", userId)
    .order("last_message_time", { ascending: false })

  if (roomsError) throw roomsError
  if (!roomsData) return []

  // 2. 각 채팅방의 상대방 정보 조회
  const chatRooms = await Promise.all(
    roomsData.map(async (room) => {
      // 전체 참가자 조회
      const { data: allParticipants, error: participantsError } = await supabase
        .from("chat_room_participants")
        .select("*")
        .eq("chat_room_id", room.id)

      if (participantsError) throw participantsError

      // 상대방 찾기
      const otherParticipant = allParticipants?.find((p) => p.user_id !== userId)

      let otherUser = null
      if (otherParticipant?.user_id) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, name, profile_circle_img, is_online")
          .eq("id", otherParticipant.user_id)
          .single()

        if (userError) throw userError
        otherUser = userData
      }

      // chat_room_participants 컬럼은 반환 타입에 포함되지 않으므로 제거
      const { chat_room_participants: _omit, ...roomBase } = room as RoomWithParticipants
      return {
        ...roomBase,
        participants: allParticipants || [],
        otherUser,
      } as ChatRoomDetail
    }),
  )

  return chatRooms
}

/**
 * 특정 채팅방의 메시지를 조회합니다
 */
export async function getMessagesByChatRoomId(chatRoomId: string): Promise<MessageRow[]> {
  const supabase = await createClient()

  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_room_id", chatRoomId)
    .order("created_at", { ascending: true })

  if (messagesError) throw messagesError
  return messagesData || []
}

/**
 * 메시지를 생성합니다
 */
export async function createMessage(
  content: string,
  senderId: string,
  receiverId: string,
  chatRoomId?: string | null,
): Promise<MessageWithRoom> {
  const supabase = await createClient()

  const insertData = {
    content,
    sender_id: senderId,
    receiver_id: receiverId,
    is_read: false,
    ...(chatRoomId && { chat_room_id: chatRoomId }),
  }

  const { data: messageData, error: messageError } = await supabase
    .from("messages")
    .insert(insertData)
    .select()
    .single()

  if (messageError) throw messageError
  if (!messageData.chat_room_id) {
    throw new Error("메시지 생성 후 채팅방 ID를 찾을 수 없습니다")
  }

  return messageData as MessageWithRoom
}

/**
 * 채팅방의 메시지를 읽음 처리합니다
 */
export async function markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
  const supabase = await createClient()

  const { error: rpcError } = await supabase.rpc("mark_messages_as_read", {
    p_chat_room_id: chatRoomId,
    p_user_id: userId,
  })

  if (rpcError) throw rpcError
}

/**
 * 두 사용자 간의 기존 채팅방을 찾습니다
 */
export async function findChatRoomBetweenUsers(
  currentUserId: string,
  targetUserId: string,
): Promise<string | null> {
  const supabase = await createClient()

  // 현재 사용자가 참여한 채팅방 ID들 조회
  const { data: currentUserRooms, error: currentUserError } = await supabase
    .from("chat_room_participants")
    .select("chat_room_id")
    .eq("user_id", currentUserId)

  if (currentUserError) throw currentUserError
  if (!currentUserRooms || currentUserRooms.length === 0) return null

  const chatRoomIds = currentUserRooms
    .filter((room) => room.chat_room_id)
    .map((room) => room.chat_room_id as string)

  if (chatRoomIds.length === 0) return null

  // 타겟 사용자도 참여한 채팅방 찾기
  const { data: targetUserRooms, error: targetUserError } = await supabase
    .from("chat_room_participants")
    .select("chat_room_id")
    .eq("user_id", targetUserId)
    .in("chat_room_id", chatRoomIds)

  if (targetUserError) throw targetUserError
  if (!targetUserRooms || targetUserRooms.length === 0) return null

  return targetUserRooms[0].chat_room_id as string
}

/**
 * 새 채팅방을 생성합니다
 */
export async function createChatRoom(currentUserId: string, targetUserId: string): Promise<string> {
  const supabase = await createClient()

  // 트랜잭션처럼 처리하기 위해 순차적으로 실행
  try {
    // 1. 채팅방 생성
    const { data: chatRoomData, error: chatRoomError } = await supabase
      .from("chat_rooms")
      .insert({
        last_message: "대화가 시작되었습니다.",
        last_message_time: new Date().toISOString(),
      })
      .select()
      .single()

    if (chatRoomError) throw chatRoomError

    // 2. 참가자 추가
    const { error: participantsError } = await supabase.from("chat_room_participants").insert([
      { chat_room_id: chatRoomData.id, user_id: currentUserId, unread_count: 0 },
      { chat_room_id: chatRoomData.id, user_id: targetUserId, unread_count: 0 },
    ])

    if (participantsError) {
      // 롤백을 위해 생성된 채팅방 삭제 시도
      await supabase.from("chat_rooms").delete().eq("id", chatRoomData.id)
      throw participantsError
    }

    // 3. 초기 메시지 생성
    const { error: messageError } = await supabase.from("messages").insert({
      content: "대화가 시작되었습니다.",
      sender_id: currentUserId,
      receiver_id: targetUserId,
      chat_room_id: chatRoomData.id,
      is_read: false,
    })

    if (messageError) {
      // 롤백을 위해 생성된 데이터 삭제 시도
      await supabase.from("chat_room_participants").delete().eq("chat_room_id", chatRoomData.id)
      await supabase.from("chat_rooms").delete().eq("id", chatRoomData.id)
      throw messageError
    }

    return chatRoomData.id
  } catch (error) {
    throw error
  }
}

/**
 * 채팅방 상세 정보를 조회합니다
 */
export async function getChatRoomById(
  chatRoomId: string,
  userId: string,
): Promise<ChatRoomDetail | null> {
  const supabase = await createClient()

  // 1. 채팅방 기본 정보 조회
  const { data: roomData, error: roomError } = await supabase
    .from("chat_rooms")
    .select("*")
    .eq("id", chatRoomId)
    .single()

  if (roomError) throw roomError
  if (!roomData) return null

  // 2. 참가자 정보 조회
  const { data: participants, error: participantsError } = await supabase
    .from("chat_room_participants")
    .select("*")
    .eq("chat_room_id", chatRoomId)

  if (participantsError) throw participantsError

  // 3. 상대방 정보 조회
  const otherParticipant = participants?.find((p) => p.user_id !== userId)
  let otherUser = null

  if (otherParticipant?.user_id) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, profile_circle_img, is_online")
      .eq("id", otherParticipant.user_id)
      .single()

    if (userError) throw userError
    otherUser = userData
  }

  return {
    ...roomData,
    participants: participants || [],
    otherUser,
  }
}
