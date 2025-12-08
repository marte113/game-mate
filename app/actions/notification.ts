"use server"

import {
  svcGetNotificationsForCurrentUser,
  svcMarkNotificationAsReadForCurrentUser,
  svcMarkAllNotificationsAsReadForCurrentUser,
  svcMarkTaskNotificationsAsReadForCurrentUser,
  svcMarkHeaderNotificationsAsReadForCurrentUser,
  svcMarkChatNotificationsAsReadForCurrentUser,
  type NotificationsWithUnreadCount,
} from "@/app/apis/service/notification/notification.service.server"

/**
 * 현재 사용자의 알림 목록 및 읽지 않은 알림 수 조회
 */
export async function getNotifications(): Promise<NotificationsWithUnreadCount> {
  return svcGetNotificationsForCurrentUser()
}

/**
 * 단일 알림 읽음 처리
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  return svcMarkNotificationAsReadForCurrentUser(notificationId)
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  return svcMarkAllNotificationsAsReadForCurrentUser()
}

/**
 * 태스크(의뢰) 관련 알림 읽음 처리
 */
export async function markTaskNotificationsAsRead(): Promise<void> {
  return svcMarkTaskNotificationsAsReadForCurrentUser()
}

/**
 * 헤더 알림 읽음 처리 (메시지, 의뢰 제외)
 */
export async function markHeaderNotificationsAsRead(): Promise<void> {
  return svcMarkHeaderNotificationsAsReadForCurrentUser()
}

/**
 * 특정 채팅방의 메시지 알림 읽음 처리
 */
export async function markChatNotificationsAsRead(chatRoomId: string): Promise<void> {
  return svcMarkChatNotificationsAsReadForCurrentUser(chatRoomId)
}
