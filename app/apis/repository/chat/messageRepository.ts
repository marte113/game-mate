import "server-only"

import { getServerSupabase, wrapRepo, callRpc } from "@/app/apis/base"
import type { Database } from "@/types/database.types"

export async function fetchMessagesByRoom(
  roomId: string,
): Promise<Array<Database["public"]["Tables"]["messages"]["Row"]>> {
  return wrapRepo("chat.fetchMessagesByRoom", async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_room_id", roomId)
      .order("created_at", { ascending: true })
    if (error) throw error
    return (data ?? []) as Array<Database["public"]["Tables"]["messages"]["Row"]>
  })
}

export async function markMessagesAsRead(roomId: string, userId: string) {
  return wrapRepo("chat.markMessagesAsRead", async () => {
    await callRpc("mark_messages_as_read", { p_chat_room_id: roomId, p_user_id: userId })
  })
}

export async function fetchMessageIdsByChatRoomAndReceiver(
  roomId: string,
  receiverId: string,
): Promise<string[]> {
  return wrapRepo("chat.fetchMessageIdsByChatRoomAndReceiver", async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("messages")
      .select("id")
      .eq("chat_room_id", roomId)
      .eq("receiver_id", receiverId)

    if (error) throw error
    return (data ?? []).map((row) => String((row as { id: unknown }).id))
  })
}
