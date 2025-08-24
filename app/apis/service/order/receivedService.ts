import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { fetchReceivedOrdersByProvider } from '@/app/apis/repository/order/requestRepository'

export async function getMyReceivedOrders(params?: { status?: string }) {
  return wrapService('order.getMyReceivedOrders', async () => {
    const userId = await getCurrentUserId()
    const orders = await fetchReceivedOrdersByProvider(userId, { status: params?.status })
    return { orders }
  })
}


