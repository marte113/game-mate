import { Chat_roomsRow, Chat_room_participantsRow, MessagesRow } from "@/types/database.table.types"

// 기본 사용자 타입
export interface OtherUser {
  id: string
  name: string
  profile_circle_img: string | null
  is_online: boolean | null
}

// 채팅방 참가자 타입 (기존 테이블 타입을 확장)
export interface ChatRoomParticipant extends Chat_room_participantsRow {}

// 기존 코드와 호환성을 위한 ChatRoom 타입
export interface ChatRoom {
  id: string
  last_message: string | null
  last_message_time: string | null
  participants: ChatRoomParticipant[] // 이름 유지
  otherUser: OtherUser | null
}

// 데이터베이스 확장 타입 (내부 API용)
export interface ExtendedChatRoom extends Chat_roomsRow {
  chat_room_participants: Chat_room_participantsRow[]
  otherUser?: OtherUser | null
}

// 메시지 타입 (기존 테이블 타입을 확장)
export interface Message extends MessagesRow {}

// API 응답 타입
export interface ChatRoomsResponse {
  chatRooms: ChatRoom[]
}

export interface MessagesResponse {
  messages: Message[]
}

export interface ChatRoomResponse {
  chatRoom: ChatRoom
}

// API 요청 타입
export interface CreateChatRoomRequest {
  userId: string
}

export interface SendMessageRequest {
  content: string
  receiverId: string
  chatRoomId?: string
}

// API 응답 상태 타입
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Zustand 스토어 상태 타입 (리팩토링 후)
export interface ChatState {
  chatRooms: ChatRoom[]
  currentChatRoom: string | null
  selectedChat: ChatRoom | null
  messages: Message[]
  
  setChatRooms: (chatRooms: ChatRoom[]) => void
  setMessages: (messages: Message[]) => void
  setCurrentChatRoom: (roomId: string | null) => void
  setSelectedChat: (chat: ChatRoom | null) => void
}

// 실시간 구독 타입
export interface MessagePayload {
  new: Message
  old: Message | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

// API 응답에서 확장된 타입을 ChatRoom으로 변환하는 매핑 함수
export const mapToClientChatRoom = (room: ExtendedChatRoom): ChatRoom => ({
  id: room.id,
  last_message: room.last_message,
  last_message_time: room.last_message_time,
  participants: room.chat_room_participants,  // 필드명 변환
  otherUser: room.otherUser || null
})



