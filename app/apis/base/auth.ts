'use server'
import { getServerSupabase } from './client'
import { UnauthorizedError } from './errors'

export async function getCurrentUserId(): Promise<string> {
  const supabase = await getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new UnauthorizedError('사용자 인증 오류')
  return user.id
}


