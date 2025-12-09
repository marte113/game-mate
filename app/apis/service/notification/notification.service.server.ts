import "server-only"

import { wrapService } from "@/app/apis/base"
import { getCurrentUserId } from "@/app/apis/base/auth"
import type { NotificationRow } from "@/app/apis/repository/notification/notification.repository.server"
import {
  repoGetNotificationsByUserId,
  repoMarkAllNotificationsAsRead,
  repoMarkHeaderNotificationsAsRead,
  repoMarkMessageNotificationsAsReadForMessages,
  repoMarkNotificationAsRead,
  repoMarkTaskNotificationsAsRead,
} from "@/app/apis/repository/notification/notification.repository.server"
import { repoResetUnreadCountForChatParticipant } from "@/app/apis/repository/chat/chatRoomParticipants.repository.server"
import {
  fetchMessageIdsByChatRoomAndReceiver,
  fetchChatRoomIdByMessageId,
} from "@/app/apis/repository/chat/messageRepository"

export type UnreadCount = {
  total: number
  message: number
  request: number
  follow: number
}

export type NotificationsWithUnreadCount = {
  notifications: NotificationRow[]
  unreadCount: UnreadCount
}

export async function svcGetNotificationsForCurrentUser(): Promise<NotificationsWithUnreadCount> {
  return wrapService("notification.svcGetNotificationsForCurrentUser", async () => {
    const userId = await getCurrentUserId()
    const notifications = await repoGetNotificationsByUserId(userId)

    const unreadNotifications = notifications.filter((n) => !n.is_read)
    const unreadCount: UnreadCount = {
      total: unreadNotifications.length,
      message: unreadNotifications.filter((n) => n.type === "message").length,
      request: unreadNotifications.filter((n) =>
        ["request", "accept", "reject", "cancel", "complete"].includes((n.type as string) || ""),
      ).length,
      follow: unreadNotifications.filter((n) => n.type === "follow").length,
    }

    return { notifications, unreadCount }
  })
}

export async function svcMarkNotificationAsReadForCurrentUser(
  notificationId: string,
): Promise<void> {
  return wrapService("notification.svcMarkNotificationAsReadForCurrentUser", async () => {
    const userId = await getCurrentUserId()
    await repoMarkNotificationAsRead(userId, notificationId)
  })
}

export async function svcMarkAllNotificationsAsReadForCurrentUser(): Promise<void> {
  return wrapService("notification.svcMarkAllNotificationsAsReadForCurrentUser", async () => {
    const userId = await getCurrentUserId()
    await repoMarkAllNotificationsAsRead(userId)
  })
}

export async function svcMarkTaskNotificationsAsReadForCurrentUser(): Promise<void> {
  return wrapService("notification.svcMarkTaskNotificationsAsReadForCurrentUser", async () => {
    const userId = await getCurrentUserId()
    await repoMarkTaskNotificationsAsRead(userId)
  })
}

export async function svcMarkHeaderNotificationsAsReadForCurrentUser(): Promise<void> {
  return wrapService("notification.svcMarkHeaderNotificationsAsReadForCurrentUser", async () => {
    const userId = await getCurrentUserId()
    const excludedTypes = ["message", "request", "accept", "reject", "cancel", "complete"]
    await repoMarkHeaderNotificationsAsRead(userId, excludedTypes)
  })
}

export async function svcMarkChatNotificationsAsReadForCurrentUser(
  chatRoomId: string,
): Promise<void> {
  return wrapService("notification.svcMarkChatNotificationsAsReadForCurrentUser", async () => {
    const userId = await getCurrentUserId()

    await repoResetUnreadCountForChatParticipant(chatRoomId, userId)

    const messageIds = await fetchMessageIdsByChatRoomAndReceiver(chatRoomId, userId)
    if (!messageIds.length) return

    await repoMarkMessageNotificationsAsReadForMessages(userId, messageIds)
  })
}

/**
 * 메시지 알림이 현재 보고 있는 채팅방의 것인지 확인하고, 맞다면 읽음 처리
 * @returns suppressed: true면 알림 억제됨 (UI 갱신 불필요)
 */
export async function svcMarkMessageNotificationIfInRoom(
  notificationId: string,
  messageId: string,
  currentChatRoomId: string,
): Promise<{ suppressed: boolean }> {
  return wrapService("notification.svcMarkMessageNotificationIfInRoom", async () => {
    const userId = await getCurrentUserId()

    // 메시지의 채팅방 ID 조회
    const messageChatRoomId = await fetchChatRoomIdByMessageId(messageId)

    // 현재 보고 있는 채팅방과 일치하지 않으면 억제하지 않음
    if (messageChatRoomId !== currentChatRoomId) {
      return { suppressed: false }
    }

    // 일치하면 해당 알림을 읽음 처리
    await repoMarkNotificationAsRead(userId, notificationId)
    return { suppressed: true }
  })
}
