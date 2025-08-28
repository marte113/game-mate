'use client'

import { create } from 'zustand'
import { createClient } from '@/supabase/functions/client'

import { Database } from '@/types/database.types'

// 클라이언트 컴포넌트용 Supabase 인스턴스 생성
const supabase = createClient()

type Tables = Database['public']['Tables']
type ChatRoomRow = Tables['chat_rooms']['Row']
type ChatRoomParticipantRow = Tables['chat_room_participants']['Row']
type MessageRow = Tables['messages']['Row']

interface ExtendedChatRoom extends ChatRoomRow {
  chat_room_participants: ChatRoomParticipantRow[]
  otherUser?: {
    id: string
    name: string
    profile_circle_img: string | null
    is_online: boolean
  } | null
}

interface Message extends MessageRow {}

interface ChatRoom {
  id: string
  last_message: string | null
  last_message_time: string | null
  participants: {
    id: string
    chat_room_id: string | null
    user_id: string | null
    unread_count: number | null
    created_at: string | null
    updated_at: string | null
  }[]
  otherUser: {
    id: string
    name: string
    profile_circle_img: string | null
    is_online: boolean | null
  } | null
}

interface ChatState {
  chatRooms: ChatRoom[]
  currentChatRoom: string | null
  selectedChat: ChatRoom | null
  messages: Message[]
  isLoading: boolean
  error: string | null
  
  fetchChatRooms: () => Promise<void>
  fetchMessages: (roomId: string) => Promise<void>
  sendMessage: (content: string, receiverId: string, chatRoomId?: string | null) => Promise<void>
  markAsRead: (roomId: string) => Promise<void>
  setCurrentChatRoom: (roomId: string | null) => void
  setSelectedChat: (chat: ChatRoom | null) => void
  subscribeToMessages: () => () => void
  findOrCreateChatWithUser: (userId: string) => Promise<string | null>
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatRooms: [],
  currentChatRoom: null,
  selectedChat: null,
  messages: [],
  isLoading: false,
  error: null,
  
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  
  fetchChatRooms: async () => {
    try {
      set({ isLoading: true, error: null })
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error('사용자 정보를 찾을 수 없습니다')
      const userId = userData.user.id
      const { data: roomsData, error: roomsError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          last_message,
          last_message_time,
          chat_room_participants!left(id, chat_room_id, user_id, unread_count)
        `)
        .order('last_message_time', { ascending: false })
      if (roomsError) throw roomsError
      const typedRoomsData = roomsData as unknown as ExtendedChatRoom[]
      const chatRooms = await Promise.all(
        typedRoomsData.map(async (room) => {
          const participant = room.chat_room_participants?.find(p => p.user_id !== userId)
          const otherParticipantId = participant?.user_id
          if (!otherParticipantId) return { 
            ...room, 
            participants: room.chat_room_participants || [],
            otherUser: null 
          }
          const { data: otherUserData } = await supabase
            .from('users')
            .select('id, name, profile_circle_img, is_online')
            .eq('id', otherParticipantId)
            .single()
          return {
            ...room,
            participants: room.chat_room_participants || [],
            otherUser: otherUserData
          }
        })
      )
      set({ chatRooms, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '채팅방 목록을 가져오는 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
    }
  },
  
  fetchMessages: async (roomId) => {
    try {
      set({ isLoading: true, error: null })
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })
      if (messagesError) throw messagesError
      set({ messages: messagesData || [], currentChatRoom: roomId, isLoading: false })
      await get().markAsRead(roomId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '메시지를 가져오는 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
    }
  },
  
  sendMessage: async (content, receiverId, chatRoomId = null) => {
    try {
      set({ isLoading: true, error: null })
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error('사용자 정보를 찾을 수 없습니다')
      const senderId = userData.user.id
      const insertData = {
        content,
        sender_id: senderId,
        receiver_id: receiverId,
        is_read: false,
        ...(chatRoomId && { chat_room_id: chatRoomId })
      } as const
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert(insertData)
        .select()
      if (messageError) throw messageError
      const currentRoom = get().currentChatRoom
      if (currentRoom) {
        await get().fetchMessages(currentRoom)
      } else if (messageData?.[0]?.chat_room_id) {
        await get().fetchMessages(messageData[0].chat_room_id)
      }
      await get().fetchChatRooms()
      set({ isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '메시지 전송 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
    }
  },
  
  markAsRead: async (roomId) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error('사용자 정보를 찾을 수 없습니다')
      const userId = userData.user.id
      const { error: rpcError } = await supabase.rpc('mark_messages_as_read', {
        p_chat_room_id: roomId,
        p_user_id: userId
      })
      if (rpcError) throw rpcError
      await get().fetchChatRooms()
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  },
  
  setCurrentChatRoom: (roomId) => {
    set({ currentChatRoom: roomId })
    if (roomId) {
      get().fetchMessages(roomId)
    }
  },
  
  findOrCreateChatWithUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('인증 오류:', userError)
        throw new Error('로그인 세션을 확인하세요: ' + userError.message)
      }
      if (!userData.user) throw new Error('사용자 정보를 찾을 수 없습니다')
      const currentUserId = userData.user.id
      const { data: existingRooms } = await supabase
        .from('chat_room_participants')
        .select(`
          chat_room_id,
          chat_rooms!left(id)
        `)
        .eq('user_id', currentUserId)
      if (existingRooms && existingRooms.length > 0) {
        const chatRoomIds = existingRooms
          .filter(room => room.chat_room_id)
          .map(room => room.chat_room_id as string)
        if (chatRoomIds.length > 0) {
          const { data: otherUserRooms } = await supabase
            .from('chat_room_participants')
            .select('chat_room_id')
            .eq('user_id', userId)
            .in('chat_room_id', chatRoomIds)
          if (otherUserRooms && otherUserRooms.length > 0) {
            const roomId = otherUserRooms[0].chat_room_id as string
            get().setCurrentChatRoom(roomId)
            set({ isLoading: false })
            return roomId
          }
        }
      }
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          last_message: '대화가 시작되었습니다.',
          last_message_time: new Date().toISOString()
        })
        .select()
        .single()
      if (error) throw error
      const { error: participantsError } = await supabase
        .from('chat_room_participants')
        .insert([
          { chat_room_id: data.id, user_id: currentUserId, unread_count: 0 },
          { chat_room_id: data.id, user_id: userId, unread_count: 0 }
        ])
      if (participantsError) throw participantsError
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          content: '대화가 시작되었습니다.',
          sender_id: currentUserId,
          receiver_id: userId,
          chat_room_id: data.id,
          is_read: false
        })
        .select()
      if (messageError) throw messageError
      await get().fetchChatRooms()
      get().setCurrentChatRoom(data.id)
      set({ isLoading: false })
      return data.id
    } catch (error) {
      console.error('채팅방 생성 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '채팅방을 생성하는 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
      return null
    }
  },
  
  subscribeToMessages: () => {
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload) => {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        const currentRoom = get().currentChatRoom
        if (currentRoom && currentRoom === payload.new.chat_room_id) {
          get().fetchMessages(currentRoom)
          if (payload.new.receiver_id === userId) {
            get().markAsRead(currentRoom)
          }
        } else {
          get().fetchChatRooms()
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(subscription)
    }
  }
}))