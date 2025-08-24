'use server'
import { getServerSupabase } from '@/app/apis/base'

type GameRow = { id: string; name: string; description: string | null; image_url: string | null }
type RecommendedGameLatestRow = { game_id: string; player_count: number }

export async function getRecommendedLatest(offset: number, limit: number) {
  const supabase = await getServerSupabase()
  const { data, error, count } = await (supabase as any)
    .from('recommended_games_latest')
    .select('game_id, player_count', { count: 'exact' })
    .order('player_count', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return { latest: (data as RecommendedGameLatestRow[] | null) ?? [], total: count as number | null }
}

export async function getGamesByIds(gameIds: string[]) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('games')
    .select('id, name, description, image_url')
    .in('id', gameIds)
  if (error) throw error
  return (data as GameRow[] | null) ?? []
}

export async function getMatesBySelectedGames(gameDescs: string[]) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select(`
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
    `)
    .eq('is_mate', true)
    .overlaps('selected_games', gameDescs)
  if (error) throw error
  return data ?? []
}

export async function getCompletedRequestsByGames(gameNames: string[], sinceISO: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('requests')
    .select('provider_id, game, created_at, status')
    .in('game', gameNames)
    .gte('created_at', sinceISO)
    .eq('status', 'COMPLETED')
  if (error) throw error
  return data ?? []
}


