import "server-only"

import { getServerSupabase, wrapRepo } from "@/app/apis/base"
import type { Database } from "@/types/database.types"

type Tables = Database["public"]["Tables"]
export type ChatRoomParticipantRow = Tables["chat_room_participants"]["Row"]

export async function repoResetUnreadCountForChatParticipant(
  chatRoomId: string,
  userId: string,
): Promise<void> {
  return wrapRepo("chat.repoResetUnreadCountForChatParticipant", async () => {
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("chat_room_participants")
      .update({ unread_count: 0 })
      .eq("chat_room_id", chatRoomId)
      .eq("user_id", userId)

    if (error) throw error
  })
}
