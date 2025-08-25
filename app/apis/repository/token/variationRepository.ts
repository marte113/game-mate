import 'server-only'

import { getServerSupabase } from '@/app/apis/base'
import { wrapRepo } from '@/app/apis/base'
import type { Database } from '@/types/database.types'

export type MonthlyUsageResult = Database['public']['Functions']['get_monthly_token_usage']['Returns'][number]

export async function fetchMonthlyTokenUsage(userId: string): Promise<MonthlyUsageResult> {
  return wrapRepo('token.fetchMonthlyTokenUsage', async () => {
    const supabase = await getServerSupabase()
    const current_ts = new Date().toISOString()
    const { data, error } = await supabase.rpc('get_monthly_token_usage', {
      user_id_param: userId,
      current_ts,
    })
    if (error) throw error
    const result = (Array.isArray(data) ? data[0] : data) as MonthlyUsageResult
    return result
  })
}


