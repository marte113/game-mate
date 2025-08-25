import 'server-only'

import { getServerSupabase } from '@/app/apis/base'
import { wrapRepo } from '@/app/apis/base'
import type { Database } from '@/types/database.types'

export type UserTokenBalance = Pick<Database['public']['Tables']['user_tokens']['Row'], 'balance'>

export async function fetchUserBalanceByUserId(userId: string): Promise<UserTokenBalance | null> {
  return wrapRepo('token.fetchUserBalanceByUserId', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data as UserTokenBalance
  })
}


