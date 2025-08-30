'use server'
import { getServerSupabase } from './client'
import { createUnauthorizedError } from './errors'

export async function getCurrentUserId(): Promise<string> {
  const supabase = await getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw createUnauthorizedError('사용자 인증 오류')
  return user.id
}


