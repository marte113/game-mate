'use server'
import { getServerSupabase } from '@/app/apis/base'

export async function listGames(offset: number, limit: number) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('games')
    .select('id, name, genre, description, image_url')
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return data ?? []
}


