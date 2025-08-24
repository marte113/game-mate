import 'server-only'

import { getServerSupabase } from '@/app/apis/base'
import { wrapRepo } from '@/app/apis/base'

export interface TokenTransactionRow {
  id: string
  user_id: string
  amount: number
  type: string
  created_at: string
  // 기타 컬럼은 실제 스키마에 맞춰 확장
}

type ListOptions = {
  beforeCreatedAt?: string
  limit?: number
}

export async function fetchUserTransactions(
  userId: string,
  options: ListOptions = {},
): Promise<TokenTransactionRow[]> {
  return wrapRepo('token.fetchUserTransactions', async () => {
    const supabase = await getServerSupabase()
    let query = supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options.beforeCreatedAt) {
      query = query.lt('created_at', options.beforeCreatedAt)
    }
    if (typeof options.limit === 'number') {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as TokenTransactionRow[]
  })
}


