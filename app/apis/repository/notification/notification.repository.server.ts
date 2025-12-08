import "server-only"

import { getServerSupabase, wrapRepo } from "@/app/apis/base"
import type { Database } from "@/types/database.types"

type Tables = Database["public"]["Tables"]
export type NotificationRow = Tables["notifications"]["Row"]

export async function repoGetNotificationsByUserId(userId: string): Promise<NotificationRow[]> {
  return wrapRepo("notification.repoGetNotificationsByUserId", async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return (data ?? []) as NotificationRow[]
  })
}

export async function repoMarkNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  return wrapRepo("notification.repoMarkNotificationAsRead", async () => {
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId)

    if (error) throw error
  })
}

export async function repoMarkAllNotificationsAsRead(userId: string): Promise<void> {
  return wrapRepo("notification.repoMarkAllNotificationsAsRead", async () => {
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) throw error
  })
}

export async function repoMarkTaskNotificationsAsRead(userId: string): Promise<void> {
  return wrapRepo("notification.repoMarkTaskNotificationsAsRead", async () => {
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .in("type", ["request", "accept", "reject", "cancel", "complete"])

    if (error) throw error
  })
}

export async function repoMarkHeaderNotificationsAsRead(
  userId: string,
  excludedTypes: string[],
): Promise<void> {
  return wrapRepo("notification.repoMarkHeaderNotificationsAsRead", async () => {
    const supabase = await getServerSupabase()

    let query = supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    excludedTypes.forEach((type) => {
      query = query.not("type", "eq", type)
    })

    const { error } = await query
    if (error) throw error
  })
}

export async function repoMarkMessageNotificationsAsReadForMessages(
  userId: string,
  messageIds: string[],
): Promise<void> {
  if (messageIds.length === 0) return

  return wrapRepo("notification.repoMarkMessageNotificationsAsReadForMessages", async () => {
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("type", "message")
      .eq("is_read", false)
      .in("related_id", messageIds)

    if (error) throw error
  })
}
