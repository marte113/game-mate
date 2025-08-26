// stores/notificationStore.ts
'use client'

import { create } from 'zustand'

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
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('알림 조회 실패:', response.statusText)
        return
      }

      const data = await response.json()

      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount
      })
    } catch (error) {
      console.error('알림 조회 중 에러:', error)
    }
  },
  
  markAsRead: async (id) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationId: id })
      })

      if (!response.ok) {
        console.error('알림 읽음 처리 실패:', response.statusText)
        return
      }

      await get().fetchNotifications()
    } catch (error) {
      console.error('알림 읽음 처리 중 에러:', error)
    }
  },
  
  markAllAsRead: async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('모든 알림 읽음 처리 실패:', response.statusText)
        return
      }

      await get().fetchNotifications()
    } catch (error) {
      console.error('모든 알림 읽음 처리 중 에러:', error)
    }
  },
  
  subscribeToNotifications: () => {
    // 실시간 구독을 위한 API 호출
    const eventSource = new EventSource('/api/notifications/subscribe')

    eventSource.onmessage = (event) => {
      if (event.data === 'notification_update') {
        get().fetchNotifications()
      }
    }

    // 클린업 함수 반환
    return () => {
      eventSource.close()
    }
  },
  
  markChatNotificationsAsRead: async (chatRoomId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-chat-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ chatRoomId })
      })

      if (!response.ok) {
        console.error('채팅 알림 읽음 처리 실패:', response.statusText)
        return
      }

      await get().fetchNotifications()
    } catch (error) {
      console.error('채팅 알림 읽음 처리 중 에러:', error)
    }
  },
  
  markTaskNotificationsAsRead: async () => {
    try {
      const response = await fetch('/api/notifications/mark-task-read', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('태스크 알림 읽음 처리 실패:', response.statusText)
        return
      }

      await get().fetchNotifications()
    } catch (error) {
      console.error('태스크 알림 읽음 처리 중 에러:', error)
    }
  },
  
  markHeaderNotificationsAsRead: async () => {
    try {
      const response = await fetch('/api/notifications/mark-header-read', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('헤더 알림 읽음 처리 실패:', response.statusText)
        return
      }

      await get().fetchNotifications()
    } catch (error) {
      console.error('헤더 알림 읽음 처리 중 에러:', error)
    }
  },
  
  // Realtime 구독 설정을 위한 새 함수 (보안 강화)
  setupNotificationSubscription: () => {
    // Server-Sent Events를 사용한 실시간 구독
    const eventSource = new EventSource('/api/notifications/subscribe')

    eventSource.onmessage = (event) => {
      if (event.data === 'notification_update') {
        get().fetchNotifications()
      }
    }

    eventSource.onerror = (error) => {
      console.error('알림 구독 에러:', error)
    }

    // 구독 해제 함수 반환
    return () => {
      eventSource.close()
    }
  }
}))