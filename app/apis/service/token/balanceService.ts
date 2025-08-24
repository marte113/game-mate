import 'server-only'

import { getCurrentUserId } from '@/app/apis/base/auth'
import { wrapService } from '@/app/apis/base'
import { fetchUserBalanceByUserId } from '@/app/apis/repository/token/tokenRepository'

export async function getMyTokenBalance() {
  return wrapService('token.getMyTokenBalance', async () => {
    const userId = await getCurrentUserId()
    const balance = await fetchUserBalanceByUserId(userId)
    return { balance }
  })
}


