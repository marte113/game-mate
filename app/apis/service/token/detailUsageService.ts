import 'server-only'

import { getCurrentUserId } from '@/app/apis/base/auth'
import { wrapService } from '@/app/apis/base'
import { fetchUserTransactions } from '@/app/apis/repository/token/transactionRepository'

// 상세 사용 내역은 거래 목록을 페이지네이션해 제공
export async function getMyDetailUsage(params: { pageParam?: string; limit?: number } = {}) {
  return wrapService('token.getMyDetailUsage', async () => {
    const userId = await getCurrentUserId()
    const data = await fetchUserTransactions(userId, {
      beforeCreatedAt: params.pageParam,
      limit: params.limit ?? 20,
    })
    return { success: true, data }
  })
}


