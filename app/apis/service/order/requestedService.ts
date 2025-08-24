import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { fetchRequestedOrdersByUser } from '@/app/apis/repository/order/requestRepository'

export async function getMyRequestedOrders(params?: { status?: string }) {
  return wrapService('order.getMyRequestedOrders', async () => {
    const userId = await getCurrentUserId()
    const rows = await fetchRequestedOrdersByUser(userId, { status: params?.status })

    const orders = rows.map((order) => ({
      ...order,
      has_review: Array.isArray(order.reviews) && order.reviews.length > 0,
    }))

    return { orders }
  })
}


