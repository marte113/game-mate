import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { fetchProviderReservations } from '@/app/apis/repository/order/requestRepository'

export async function getMyProviderReservations(providerId?: string) {
  return wrapService('order.getMyProviderReservations', async () => {
    const currentUserId = await getCurrentUserId()
    const targetProviderId = providerId ?? currentUserId
    // 자기 자신 이외의 providerId를 조회하려면 이후 관리자 권한 검증을 추가할 수 있음
    const orders = await fetchProviderReservations(targetProviderId)
    return { orders }
  })
}


