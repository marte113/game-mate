'use server'
import { getServerSupabase } from '@/app/apis/base'

export async function getGameByEnglishName(name: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('games')
    .select('description, image_url')
    .eq('name', name)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function listMatesByKoreanGame(koreanName: string, offset: number, limit: number) {
  const supabase = await getServerSupabase()
  const { data, error, count } = await supabase
    .from('profiles')
    .select(`
      user_id,
      public_id,
      nickname,
      rating,
      description,
      created_at,
      users (
        is_online,
        profile_thumbnail_img
      )
    `, { count: 'exact' })
    .eq('is_mate', true)
    .contains('selected_games', [koreanName])
    .order('is_online', { referencedTable: 'users', ascending: false, nullsFirst: false })
    .order('rating', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return { mates: data ?? [], total: count ?? 0 }
}


