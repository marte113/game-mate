"use server"
import { getAnonSupabase, getServerSupabase } from "@/app/apis/base"
import type { Database } from "@/types/database.types"

type GameRow = Database["public"]["Tables"]["games"]["Row"]
type RecommendedGameLatestRow = Required<
  Pick<Database["public"]["Views"]["recommended_games_latest"]["Row"], "game_id" | "player_count">
>

export async function getRecommendedLatest(offset: number, limit: number) {
  const supabase = await getAnonSupabase()
  const { data, count } = await supabase
    .from("recommended_games_latest")
    .select("game_id, player_count", { count: "exact" })
    .order("player_count", { ascending: false })
    .range(offset, offset + limit - 1)
  return {
    latest: (data as RecommendedGameLatestRow[] | null) ?? [],
    total: count as number | null,
  }
}

export async function getGamesByIds(gameIds: string[]) {
  const supabase = await getAnonSupabase()
  const { data, error } = await supabase
    .from("games")
    .select("id, name, description, image_url")
    .in("id", gameIds)
  if (error) throw error
  return (data as GameRow[] | null) ?? []
}

export async function getMatesBySelectedGames(gameDescs: string[]) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      user_id,
      nickname,
      description,
      rating,
      public_id,
      follower_count,
      created_at,
      selected_games,
      is_mate,
      users (
        is_online,
        profile_thumbnail_img
      )
    `,
    )
    .order("user_id", { ascending: true })
    .eq("is_mate", true)
    .overlaps("selected_games", gameDescs)
  if (error) throw error
  return data ?? []
}

export async function getCompletedRequestsByGames(gameNames: string[], sinceISO: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from("requests")
    .select("provider_id, game, created_at, status")
    .in("game", gameNames)
    .gte("created_at", sinceISO)
    .eq("status", "COMPLETED")
  if (error) throw error
  return data ?? []
}
