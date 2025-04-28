'use client'

import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { Database } from '@/types/database.types'

// 클라이언트 컴포넌트용 Supabase 인스턴스 생성 (쿠키 자동 처리)
const supabase = createClientComponentClient<Database>({
  options: {
    global: {
      headers: {
        'X-Client-Info': 'game-mate-client'
      }
    }
  }
})

type Tables = Database['public']['Tables']
type ChatRoomRow = Tables['chat_rooms']['Row']
type ChatRoomParticipantRow = Tables['chat_room_participants']['Row']
type MessageRow = Tables['messages']['Row']

// 확장된 타입 정의
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
      
      // 현재 사용자가 참여한 채팅방 가져오기
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error('사용자 정보를 찾을 수 없습니다')
      
      const userId = userData.user.id
      
      // 채팅방과 참가자 정보 가져오기
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
      
      // 타입 단언 사용
      const typedRoomsData = roomsData as unknown as ExtendedChatRoom[]
      
      // 각 채팅방의 다른 참가자 정보 가져오기
      const chatRooms = await Promise.all(
        typedRoomsData.map(async (room) => {
          // 현재 사용자가 아닌 다른 참가자 찾기
          const participant = room.chat_room_participants
            ?.find(p => p.user_id !== userId)
          
          const otherParticipantId = participant?.user_id
          
          if (!otherParticipantId) return { 
            ...room, 
            participants: room.chat_room_participants || [],
            otherUser: null 
          }
          
          // 다른 참가자 정보 가져오기
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
      
      // 메시지 가져오기
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })
      
      if (messagesError) throw messagesError
      
      set({ messages: messagesData || [], currentChatRoom: roomId, isLoading: false })
      
      // 메시지 읽음 처리
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
      
      // 메시지 전송

      const insertData = {
        content,
        sender_id: senderId,
        receiver_id: receiverId,
        is_read: false,
        ...(chatRoomId && { chat_room_id: chatRoomId }) // 이 부분이 핵심
      };

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert(insertData)
        .select()
      
      if (messageError) throw messageError
      
      // 성공적으로 메시지가 전송된 경우, 현재 채팅방의 메시지 목록 업데이트
      const currentRoom = get().currentChatRoom
      if (currentRoom) {
        await get().fetchMessages(currentRoom)
      } else if (messageData?.[0]?.chat_room_id) {
        // 새로운 채팅방이 생성된 경우
        await get().fetchMessages(messageData[0].chat_room_id)
      }
      
      // 채팅방 목록 새로고침
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
      
      // RPC 함수 호출
      const { error: rpcError } = await supabase.rpc('mark_messages_as_read', {
        p_chat_room_id: roomId,
        p_user_id: userId
      })
      
      if (rpcError) throw rpcError
      
      // 채팅방 목록 업데이트
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
  
  // 사용자 ID로 채팅방 찾기 또는 생성하기
  findOrCreateChatWithUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null })
      
      // 현재 사용자 정보 가져오기
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('인증 오류:', userError)
        throw new Error('로그인 세션을 확인하세요: ' + userError.message)
      }
      if (!userData.user) throw new Error('사용자 정보를 찾을 수 없습니다')
      
      const currentUserId = userData.user.id
      console.log('프로필 주인의 userId :', userId);
      console.log('currentUserId', currentUserId);

      // 이미 존재하는 채팅방 찾기
      const { data: existingRooms, error: roomsError } = await supabase
        .from('chat_room_participants')
        .select(`
          chat_room_id,
          chat_rooms!left(id)
        `)
        .eq('user_id', currentUserId)
      
      console.log('existingRooms', existingRooms);
      
      if (existingRooms && existingRooms.length > 0) {
        // 상대방이 같은 채팅방에 있는지 확인
        const chatRoomIds = existingRooms
          .filter(room => room.chat_room_id) // null이 아닌 값만 필터링
          .map(room => room.chat_room_id);
        
        if (chatRoomIds.length > 0) {
          const { data: otherUserRooms } = await supabase
            .from('chat_room_participants')
            .select('chat_room_id')
            .eq('user_id', userId)
            .in('chat_room_id', chatRoomIds)
          
          // 공통 채팅방이 있으면 해당 채팅방으로 이동
          if (otherUserRooms && otherUserRooms.length > 0) {
            const roomId = otherUserRooms[0].chat_room_id
            get().setCurrentChatRoom(roomId)
            set({ isLoading: false })
            return roomId
          }
        }
      }
      
      // 기존 채팅방이 없으면 새 채팅방을 직접 생성
      console.log('채팅방 직접 생성 시작');
      
      // 세션 확인 로그
      const { data: session } = await supabase.auth.getSession()
      console.log('현재 세션 상태:', {
        세션유무: !!session?.session,
        만료시간: session?.session?.expires_at,
        유저ID: session?.session?.user?.id
      });
      
      try {
        // 1. 채팅방 생성 - 오류 처리 강화
        const { data, error } = await supabase
          .from('chat_rooms')
          .insert({
            last_message: '대화가 시작되었습니다.',
            last_message_time: new Date().toISOString()
          })
          .select()
          .single();
        
        // 응답 로깅
        console.log('채팅방 생성 응답', { data, error });
        
        if (error) {
          console.error('채팅방 생성 오류 상세:', {
            name: error.name,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // RLS 오류 감지 및 특별 처리
          if (error.code === '42501') {
            throw new Error('권한 오류: 채팅방 생성 권한이 없습니다. 관리자에게 문의하세요.');
          }
          
          throw error;
        }
        
        console.log('생성된 채팅방:', data);
        
        // 2. 참가자 추가
        const { error: participantsError } = await supabase
          .from('chat_room_participants')
          .insert([
            { chat_room_id: data.id, user_id: currentUserId, unread_count: 0 },
            { chat_room_id: data.id, user_id: userId, unread_count: 0 }
          ]);
        
        if (participantsError) {
          console.error('참가자 추가 오류:', participantsError);
          throw participantsError;
        }
        
        // 3. 메시지 추가
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert({
            content: '대화가 시작되었습니다.',
            sender_id: currentUserId,
            receiver_id: userId,
            chat_room_id: data.id,
            is_read: false
          })
          .select();
        
        if (messageError) {
          console.error('메시지 추가 오류:', messageError);
          throw messageError;
        }
        
        // 채팅방 목록 새로고침
        await get().fetchChatRooms()
        
        // 새 채팅방 ID 반환
        get().setCurrentChatRoom(data.id)
        set({ isLoading: false })
        return data.id
        
      } catch (error) {
        console.error('채팅방 생성 오류:', error);
        const errorMessage = error instanceof Error ? error.message : '채팅방을 생성하는 중 오류가 발생했습니다'
        set({ error: errorMessage, isLoading: false })
        return null
      }
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '채팅방을 생성하는 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
      return null
    }
  },
  
  subscribeToMessages: () => {
    // 새 메시지 구독
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
        // 새 메시지의 채팅방과 현재 보고 있는 채팅방이 같은 경우
        if (currentRoom && currentRoom === payload.new.chat_room_id) {
          // 메시지 목록 업데이트
          get().fetchMessages(currentRoom)
          
          // 새 메시지가 현재 사용자에게 온 경우 읽음 처리
          if (payload.new.receiver_id === userId) {
            get().markAsRead(currentRoom)
          }
        } else {
          // 다른 채팅방에서 메시지가 왔을 경우 채팅방 목록만 업데이트
          get().fetchChatRooms()
        }
      })
      .subscribe()
    
    // 구독 정리 함수 반환
    return () => {
      supabase.removeChannel(subscription)
    }
  }
}))