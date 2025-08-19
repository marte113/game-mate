// stores/notificationStore.ts
'use client'

import { create } from 'zustand'
import { createClient } from '@/libs/api/client'

import { Database } from '@/types/database.types'

export type Notification = {
  id: string
  content: string
  created_at: string | null
  is_read: boolean | null
  related_id: string | null
  type: string | null
  user_id: string | null
}

type NotificationState = {
  notifications: Notification[]
  unreadCount: {
    total: number
    message: number
    request: number
    follow: number
  }
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  subscribeToNotifications: () => () => void
  markChatNotificationsAsRead: (chatRoomId: string) => Promise<void>
  markTaskNotificationsAsRead: () => Promise<void>
  markHeaderNotificationsAsRead: () => Promise<void>
  setupNotificationSubscription: () => () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: {
    total: 0,
    message: 0,
    request: 0,
    follow: 0
  },
  
  fetchNotifications: async () => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) return
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
    
    if (data) {
      set({ notifications: data })
      
      // 읽지 않은 알림 집계
      const unreadNotifications = data.filter(n => !n.is_read)
      const unreadMessage = unreadNotifications.filter(n => n.type === 'message').length
      const unreadRequest = unreadNotifications.filter(n => 
        ['request', 'accept', 'reject', 'cancel', 'complete'].includes(n.type || '')
      ).length
      const unreadFollow = unreadNotifications.filter(n => n.type === 'follow').length
      
      set({
        unreadCount: {
          total: unreadNotifications.length,
          message: unreadMessage,
          request: unreadRequest,
          follow: unreadFollow
        }
      })
    }
  },
  
  markAsRead: async (id) => {
    const supabase = createClient()
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    await get().fetchNotifications()
  },
  
  markAllAsRead: async () => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) return
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.user.id)
      .eq('is_read', false)
    
    await get().fetchNotifications()
  },
  
  subscribeToNotifications: () => {
    const supabase = createClient()
    
    // 실시간 알림 구독
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          get().fetchNotifications()
        }
      )
      .subscribe()
    
    // 클린업 함수 반환
    return () => {
      supabase.removeChannel(subscription)
    }
  },
  
  markChatNotificationsAsRead: async (chatRoomId: string) => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    console.log("markChatNotificationsAsRead 실행")
    console.log("userData.user:", userData.user)
    console.log("chatRoomId:", chatRoomId)
    
    if (!userData.user) return
    
    // 에러 확인 추가
    const { data, error } = await supabase
      .from('chat_room_participants')
      .update({ unread_count: 0 })
      .eq('chat_room_id', chatRoomId)
      .eq('user_id', userData.user.id)
    
    // 결과 로깅 추가
    console.log("업데이트 결과:", { data, error })
    
    if (error) {
      console.error("chat_room_participants 업데이트 실패:", error)
      return
    }
    
    // 해당 채팅방의 메시지 ID 목록 가져오기 (수신자로서 받은 메시지만)
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_room_id', chatRoomId)
      .eq('receiver_id', userData.user.id)
    
    if (messages && messages.length > 0) {
      const messageIds = messages.map(msg => msg.id)
      
      // 메시지 관련 알림 읽음 처리
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userData.user.id)
        .eq('type', 'message')
        .eq('is_read', false)
        .in('related_id', messageIds)
    }
    
    await get().fetchNotifications()
  },
  
  markTaskNotificationsAsRead: async () => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) return
    
    // 의뢰 관련 알림 읽음 처리
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.user.id)
      .eq('is_read', false)
      .in('type', ['request', 'accept', 'reject', 'cancel', 'complete'])
    
    await get().fetchNotifications()
  },
  
  markHeaderNotificationsAsRead: async () => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) return
    
    // 헤더에 표시되는 일반 알림 읽음 처리
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.user.id)
      .eq('is_read', false)
      .not('type', 'in', ['message', 'request', 'accept', 'reject', 'cancel', 'complete'])
    
    await get().fetchNotifications()
  },
  
  // Realtime 구독 설정을 위한 새 함수
  setupNotificationSubscription: () => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',  // INSERT, UPDATE, DELETE 모두 처리
          schema: 'public',
          table: 'notifications'
        },
        () => {
          // 알림 변경 시 상태 갱신
          get().fetchNotifications()
        }
      )
      .subscribe()
    
    // 구독 해제 함수 반환
    return () => supabase.removeChannel(channel)
  }
}))