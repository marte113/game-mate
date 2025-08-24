'use server'
import { getServerSupabase } from './client'

export async function getCurrentUserId(): Promise<string> {
  const supabase = await getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('사용자 인증 오류')
  return user.id
}


