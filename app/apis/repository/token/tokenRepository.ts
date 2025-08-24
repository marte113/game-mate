import 'server-only'

import { getServerSupabase } from '@/app/apis/base'
import { wrapRepo } from '@/app/apis/base'

export type UserTokenBalance = { balance: number }

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


