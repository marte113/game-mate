// app/dashboard/chat/_api/chatApi.ts
import { 
  ChatRoom, 
  ChatRoomsResponse, 
  Message, 
  MessagesResponse, 
  SendMessageRequest,
  CreateChatRoomRequest 
} from '../_types/chatTypes'

export const chatApi = {
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await fetch('/api/chat/rooms')
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '채팅방 목록을 가져오는데 실패했습니다')
    }
    const data: ChatRoomsResponse = await response.json()
    return data.chatRooms
  },

  getChatRoom: async (roomId: string): Promise<ChatRoom> => {
    const response = await fetch(`/api/chat/room/${roomId}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '채팅방을 가져오는데 실패했습니다')
    }
    const data: ChatRoom = await response.json()
    return data
  },
  
  getMessages: async (roomId: string): Promise<Message[]> => {
    const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '메시지를 가져오는데 실패했습니다')
    }
    const data: MessagesResponse = await response.json()
    return data.messages
  },
  
  sendMessage: async (content: string, receiverId: string, chatRoomId?: string): Promise<void> => {
    const payload: SendMessageRequest = { content, receiverId, chatRoomId }
    
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '메시지 전송에 실패했습니다')
    }
  },
  
  markAsRead: async (roomId: string): Promise<void> => {
    const response = await fetch(`/api/chat/rooms/${roomId}/read`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '읽음 처리에 실패했습니다')
    }
  },
  
  findOrCreateChatWithUser: async (userId: string): Promise<string | null> => {
    const payload: CreateChatRoomRequest = { userId }
    
    try {
      const response = await fetch(`/api/chat/users/${userId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '채팅방 생성에 실패했습니다')
      }
      
      const data = await response.json()
      return data.chatRoomId
    } catch (error) {
      console.error('채팅방 생성 오류:', error)
      return null
    }
  }
}