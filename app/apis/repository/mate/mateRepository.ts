'use server'
import { getServerSupabase } from '@/app/apis/base'

export async function listSimpleRecommendedMates(limit: number) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      public_id,
      nickname,
      selected_games,
      users (
        profile_circle_img,
        is_online
      )
    `)
    .eq('is_mate', true)
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function listPartnerMates(limit: number) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      public_id,
      nickname,
      selected_games,
      users (
        profile_circle_img,
        is_online
      )
    `)
    .eq('is_mate', true)
    .limit(limit)
  if (error) throw error
  return data ?? []
}


