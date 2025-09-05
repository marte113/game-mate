// useTaskSubscription.ts
"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { createClient } from "@/supabase/functions/client"
import type { Database } from "@/types/database.types"
import { useAuthStore } from "@/stores/authStore"

// (선택) 모듈 스코프 싱글턴 참조로 만들어두면 deps 경고도 자연 해소됩니다.
const supabase = createClient()

type RequestRow = Database["public"]["Tables"]["requests"]["Row"]

export function useTaskSubscription(): void {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)
  const isCleaningUpRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      console.log("[useTaskSubscription] User ID not available, skipping subscription.")
      return
    }

    const handleDbChange = (payload: RealtimePostgresChangesPayload<RequestRow>) => {
      console.log("[useTaskSubscription] DB Change detected!", {
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      })
      queryClient.invalidateQueries({ queryKey: ["receivedOrders"] })
      queryClient.invalidateQueries({ queryKey: ["requestedOrders"] })
    }

    const channel: RealtimeChannel = supabase
      .channel(`realtime-requests-tasklist-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests", filter: `provider_id=eq.${userId}` },
        handleDbChange,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests", filter: `requester_id=eq.${userId}` },
        handleDbChange,
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`[useTaskSubscription] Subscribed successfully for user ${userId}!`)
        } else if (status === "CLOSED") {
          const level: "log" | "error" = isCleaningUpRef.current ? "log" : "error"
          console[level](`[useTaskSubscription] Channel closed for user ${userId}:`, status, err)
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`[useTaskSubscription] Subscription issue for user ${userId}:`, status, err)
        }
      })

    return () => {
      isCleaningUpRef.current = true
      supabase
        .removeChannel(channel)
        .then(() =>
          console.log(`[useTaskSubscription] Channel removed successfully for user ${userId}.`),
        )
        .catch((err) =>
          console.error(`[useTaskSubscription] Error removing channel for user ${userId}:`, err),
        )
    }
    // supabase는 모듈 스코프(정적)이므로 deps에 넣을 필요 없음
  }, [userId, queryClient])
}
