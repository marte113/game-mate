// stores/notificationStore.ts
"use client"

import { create } from "zustand"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { createClient } from "@/supabase/functions/client"
import type { Database } from "@/types/database.types"
import { useChatUiStore } from "@/stores/chatUiStore"
import {
  getNotifications as fetchNotificationsAction,
  markNotificationAsRead as markNotificationAsReadAction,
  markAllNotificationsAsRead as markAllNotificationsAsReadAction,
  markChatNotificationsAsRead as markChatNotificationsAsReadAction,
  markTaskNotificationsAsRead as markTaskNotificationsAsReadAction,
  markHeaderNotificationsAsRead as markHeaderNotificationsAsReadAction,
} from "@/app/actions/notification"

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]

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

  // 알림 INSERT 이벤트 핸들러 (채팅 중 알림 억제 로직 포함)
  const handleNotificationInsert = (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
    if (unsubscribed) return

    const rawNew = payload.new
    if (!rawNew || typeof rawNew !== "object" || !("type" in rawNew)) {
      scheduleFetch()
      return
    }

    const notification = rawNew as NotificationRow
    // chatUiStore에서 현재 선택된 채팅방 직접 참조
    const selectedChat = useChatUiStore.getState().selectedChat
    const activeChatRoomId = selectedChat?.id ?? null

    // 현재 보고 있는 채팅방의 메시지 알림이면 즉시 읽음 처리 (알림 카운트 증가 안 함)
    if (
      notification.type === "message" &&
      activeChatRoomId &&
      notification.related_id === activeChatRoomId
    ) {
      // 백그라운드로 읽음 처리 후 갱신
      void get().markChatNotificationsAsRead(activeChatRoomId)
      return
    }

    // 그 외는 정상적으로 알림 갱신
    scheduleFetch()
  }

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
        handleNotificationInsert,
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
        const data = await fetchNotificationsAction()
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
        await markNotificationAsReadAction(id)
        await get().fetchNotifications()
      } catch (error) {
        console.error("알림 읽음 처리 중 에러:", error)
      }
    },

    markAllAsRead: async () => {
      try {
        await markAllNotificationsAsReadAction()
        await get().fetchNotifications()
      } catch (error) {
        console.error("모든 알림 읽음 처리 중 에러:", error)
      }
    },

    markChatNotificationsAsRead: async (chatRoomId: string) => {
      try {
        await markChatNotificationsAsReadAction(chatRoomId)
        await get().fetchNotifications()
      } catch (error) {
        console.error("채팅 알림 읽음 처리 중 에러:", error)
      }
    },

    markTaskNotificationsAsRead: async () => {
      try {
        await markTaskNotificationsAsReadAction()
        await get().fetchNotifications()
      } catch (error) {
        console.error("태스크 알림 읽음 처리 중 에러:", error)
      }
    },

    markHeaderNotificationsAsRead: async () => {
      try {
        await markHeaderNotificationsAsReadAction()
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
