'use server'
import { getServerSupabase } from '@/app/apis/base'
import type { Database } from '@/types/database.types'

export async function getProfileByUserId(userId: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error && (error as any).code !== 'PGRST116') throw error
  return data as Database['public']['Tables']['profiles']['Row'] | null
}

export async function updateProfileByUserId(userId: string, patch: Partial<Database['public']['Tables']['profiles']['Update']>) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}


