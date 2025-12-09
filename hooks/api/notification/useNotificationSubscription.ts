"use client"

import { useEffect, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { createClient } from "@/supabase/functions/client"
import { queryKeys } from "@/constants/queryKeys"
import { useChatUiStore } from "@/stores/chatUiStore"
import { markMessageNotificationIfInRoom } from "@/app/actions/notification"
import type { Database } from "@/types/database.types"

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]

// ─────────────────────────────────────────────────────────────
// 디바운스 무효화 훅
// ─────────────────────────────────────────────────────────────

/**
 * 알림 캐시 무효화 (디바운스 적용)
 */
function useInvalidateNotifications() {
  const queryClient = useQueryClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const invalidate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    }, 200)
  }, [queryClient])

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return { invalidate, cleanup }
}

// ─────────────────────────────────────────────────────────────
// 알림 INSERT 핸들러
// ─────────────────────────────────────────────────────────────

/**
 * 알림 INSERT 이벤트 처리
 * - 메시지 알림이 현재 보고 있는 채팅방의 것이면 자동 읽음 처리 (알림 억제)
 */
async function handleNotificationInsert(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  invalidate: () => void,
) {
  const rawNew = payload.new
  if (!rawNew || typeof rawNew !== "object" || !("type" in rawNew)) {
    invalidate()
    return
  }

  const notification = rawNew as NotificationRow

  // 메시지 타입이 아니면 일반 처리
  if (notification.type !== "message") {
    invalidate()
    return
  }

  // chatUiStore에서 현재 선택된 채팅방 직접 참조 (훅이 아닌 getState 사용)
  const selectedChat = useChatUiStore.getState().selectedChat
  if (!selectedChat?.id || !notification.related_id) {
    invalidate()
    return
  }

  // Server Action으로 채팅방 확인 및 읽음 처리 위임
  try {
    const result = await markMessageNotificationIfInRoom(
      notification.id,
      notification.related_id,
      selectedChat.id,
    )

    // 억제되지 않았으면 알림 목록 갱신
    if (!result.suppressed) {
      invalidate()
    }
    // 억제되었으면 아무것도 하지 않음 (UI 갱신 안 함)
  } catch {
    // 에러 발생 시 일반 처리
    invalidate()
  }
}

// ─────────────────────────────────────────────────────────────
// 메인 구독 훅
// ─────────────────────────────────────────────────────────────

/**
 * 알림 실시간 구독 훅
 * - notifications 테이블의 INSERT/UPDATE 이벤트 구독
 * - 메시지 알림이 현재 보고 있는 채팅방의 것이면 자동 읽음 처리 (알림 억제)
 */
export function useNotificationSubscription(userId: string | undefined) {
  const supabaseRef = useRef(createClient())
  const { invalidate, cleanup } = useInvalidateNotifications()

  // Realtime 구독 (순수하게 구독만 담당)
  useEffect(() => {
    if (!userId) return

    const supabase = supabaseRef.current
    let channel: RealtimeChannel | null = null

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
        (payload) => handleNotificationInsert(payload, invalidate),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        invalidate,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // 최초 1회 동기화
          invalidate()
        }
      })

    // 클린업
    return () => {
      cleanup()
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, invalidate, cleanup])
}
