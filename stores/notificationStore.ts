// stores/notificationStore.ts
"use client"

import { create } from "zustand"
import { createClient } from "@/supabase/functions/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

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
  markChatNotificationsAsRead: (chatRoomId: string) => Promise<void>
  markTaskNotificationsAsRead: () => Promise<void>
  markHeaderNotificationsAsRead: () => Promise<void>
  /** 실시간 구독 시작(중복 구독 방지). 반환값: 해제 함수 */
  startNotificationSubscription: () => () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  const supabase = createClient()
  // 중복 구독/누수 방지를 위한 클로저 상태
  let channel: RealtimeChannel | null = null
  let authUnsub: (() => void) | null = null
  let unsubscribed = false
  // 이벤트 폭주 방지용 디바운스 타이머
  let timer: ReturnType<typeof setTimeout> | null = null

  const scheduleFetch = () => {
    if (unsubscribed) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void get().fetchNotifications()
    }, 200)
  }

  const subscribeForUser = async (userId: string) => {
    // 기존 채널 정리 후 재구독
    if (channel) {
      try {
        supabase.removeChannel(channel)
      } catch {}
      channel = null
    }
    channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        scheduleFetch,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        scheduleFetch,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // 최초 1회 동기화로 UI 일관성 유지
          void get().fetchNotifications()
        }
      })
  }

  return {
    notifications: [],
    unreadCount: {
      total: 0,
      message: 0,
      request: 0,
      follow: 0,
    },

    fetchNotifications: async () => {
      try {
        const response = await fetch("/api/notifications", {
          credentials: "include",
        })

        if (!response.ok) {
          console.error("알림 조회 실패:", response.statusText)
          return
        }

        const data = await response.json()

        set({
          notifications: data.notifications,
          unreadCount: data.unreadCount,
        })
      } catch (error) {
        console.error("알림 조회 중 에러:", error)
      }
    },

    markAsRead: async (id) => {
      try {
        const response = await fetch("/api/notifications/mark-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ notificationId: id }),
        })

        if (!response.ok) {
          console.error("알림 읽음 처리 실패:", response.statusText)
          return
        }

        await get().fetchNotifications()
      } catch (error) {
        console.error("알림 읽음 처리 중 에러:", error)
      }
    },

    markAllAsRead: async () => {
      try {
        const response = await fetch("/api/notifications/mark-all-read", {
          method: "POST",
          credentials: "include",
        })

        if (!response.ok) {
          console.error("모든 알림 읽음 처리 실패:", response.statusText)
          return
        }

        await get().fetchNotifications()
      } catch (error) {
        console.error("모든 알림 읽음 처리 중 에러:", error)
      }
    },

    markChatNotificationsAsRead: async (chatRoomId: string) => {
      try {
        const response = await fetch("/api/notifications/mark-chat-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ chatRoomId }),
        })

        if (!response.ok) {
          console.error("채팅 알림 읽음 처리 실패:", response.statusText)
          return
        }

        await get().fetchNotifications()
      } catch (error) {
        console.error("채팅 알림 읽음 처리 중 에러:", error)
      }
    },

    markTaskNotificationsAsRead: async () => {
      try {
        const response = await fetch("/api/notifications/mark-task-read", {
          method: "POST",
          credentials: "include",
        })

        if (!response.ok) {
          console.error("태스크 알림 읽음 처리 실패:", response.statusText)
          return
        }

        await get().fetchNotifications()
      } catch (error) {
        console.error("태스크 알림 읽음 처리 중 에러:", error)
      }
    },

    markHeaderNotificationsAsRead: async () => {
      try {
        const response = await fetch("/api/notifications/mark-header-read", {
          method: "POST",
          credentials: "include",
        })

        if (!response.ok) {
          console.error("헤더 알림 읽음 처리 실패:", response.statusText)
          return
        }

        await get().fetchNotifications()
      } catch (error) {
        console.error("헤더 알림 읽음 처리 중 에러:", error)
      }
    },

    startNotificationSubscription: () => {
      // 중복 시작 방지: 이미 구독 중이면 no-op cleanup 반환
      if (authUnsub || channel) {
        return () => {}
      }

      unsubscribed = false
      ;(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.id) {
          await subscribeForUser(user.id)
        }
      })()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_evt, session) => {
        const uid = session?.user?.id
        if (!uid) {
          // 로그아웃: 채널 제거 + 상태 초기화
          try {
            if (channel) supabase.removeChannel(channel)
          } catch {}
          channel = null
          set({ notifications: [], unreadCount: { total: 0, message: 0, request: 0, follow: 0 } })
          return
        }
        // 로그인/사용자 전환: 새 사용자로 재구독
        await subscribeForUser(uid)
      })

      authUnsub = subscription?.unsubscribe ?? null

      // 해제 함수 반환
      return () => {
        unsubscribed = true
        if (timer) clearTimeout(timer)
        try {
          authUnsub?.()
        } catch {}
        try {
          if (channel) supabase.removeChannel(channel)
        } catch {}
        authUnsub = null
        channel = null
      }
    },
  }
})
