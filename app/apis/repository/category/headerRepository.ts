'use server'
import { getServerSupabase } from '@/app/apis/base'

export async function getGameHeaderByName(name: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('games')
    .select('description, image_url, genre')
    .eq('name', name)
    .maybeSingle()
  if (error) throw error
  return data
}


