"use server"

import { getServerSupabase, wrapRepo } from "@/app/apis/base"
import type { Database } from "@/types/database.types"

export type UserSearchItem = {
  profile_id: string
  public_id: number
  user_id: string
  username: string | null
  nickname: string | null
  profile_circle_img: string | null
  is_online: boolean | null
  name: string | null
}

export async function searchProfilesByQuery(q: string, limit = 8): Promise<UserSearchItem[]> {
  const ilike = `%${q}%`
  return wrapRepo("profile.searchProfilesByQuery", async () => {
    const supabase = await getServerSupabase()
    type JoinedRow = Database["public"]["Tables"]["profiles"]["Row"] & {
      users?: Pick<
        Database["public"]["Tables"]["users"]["Row"],
        "id" | "profile_circle_img" | "is_online" | "name"
      > | null
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `id, public_id, username, nickname, user_id,
         users:users!profiles_user_id_fkey(id, profile_circle_img, is_online, name)`,
      )
      .or(`username.ilike.${ilike},nickname.ilike.${ilike}`)
      .limit(limit)

    if (error) throw error

    return (
      (data as JoinedRow[] | null)?.map((row) => ({
        profile_id: row.id,
        public_id: row.public_id,
        user_id: row.user_id ?? "",
        username: row.username,
        nickname: row.nickname,
        profile_circle_img: row.users?.profile_circle_img ?? null,
        is_online: row.users?.is_online ?? null,
        name: row.users?.name ?? null,
      })) ?? []
    )
  })
}
