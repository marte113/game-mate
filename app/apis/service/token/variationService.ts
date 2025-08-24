import 'server-only'

import { getCurrentUserId } from '@/app/apis/base/auth'
import { wrapService } from '@/app/apis/base'
import { fetchMonthlyTokenUsage } from '@/app/apis/repository/token/variationRepository'

export async function getMyMonthlyUsage() {
  return wrapService('token.getMyMonthlyUsage', async () => {
    const userId = await getCurrentUserId()
    const usage = await fetchMonthlyTokenUsage(userId)
    return {
      success: true,
      usageThisMonth: usage?.usage_this_month ?? 0,
      usageLastMonth: usage?.usage_last_month ?? 0,
      diff: usage?.diff ?? 0,
    }
  })
}


