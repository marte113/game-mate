import 'server-only'

import { getCurrentUserId } from '@/app/apis/base/auth'
import { wrapService } from '@/app/apis/base'
import { fetchUserTransactions } from '@/app/apis/repository/token/transactionRepository'

export async function getMyTokenTransactions(params: { pageParam?: string; limit?: number } = {}) {
  return wrapService('token.getMyTokenTransactions', async () => {
    const userId = await getCurrentUserId()
    const data = await fetchUserTransactions(userId, {
      beforeCreatedAt: params.pageParam,
      limit: params.limit ?? 10,
    })
    return { success: true, data }
  })
}


