"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { getNotifications } from "@/app/actions/notification"

/**
 * 알림 목록 및 읽지 않은 알림 수 조회 훅
 */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => getNotifications(),
    staleTime: 1000 * 30, // 30초
  })
}

/**
 * 읽지 않은 알림 수만 조회하는 셀렉터 훅
 */
export function useUnreadCount() {
  const { data } = useNotifications()
  return data?.unreadCount ?? { total: 0, message: 0, request: 0, follow: 0 }
}

/**
 * 알림 목록만 조회하는 셀렉터 훅
 */
export function useNotificationList() {
  const { data } = useNotifications()
  return data?.notifications ?? []
}
