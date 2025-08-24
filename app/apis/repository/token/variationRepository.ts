import 'server-only'

import { getServerSupabase } from '@/app/apis/base'
import { wrapRepo } from '@/app/apis/base'

export interface MonthlyUsageResult {
  usage_this_month: number
  usage_last_month: number
  diff: number
}

export async function fetchMonthlyTokenUsage(userId: string): Promise<MonthlyUsageResult> {
  return wrapRepo('token.fetchMonthlyTokenUsage', async () => {
    const supabase = await getServerSupabase()
    const current_ts = new Date().toISOString()
    const { data, error } = await supabase.rpc('get_monthly_token_usage', {
      user_id_param: userId,
      current_ts,
    })
    if (error) throw error
    const result = Array.isArray(data) ? data[0] : data
    return result as MonthlyUsageResult
  })
}


