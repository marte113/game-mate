import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { callRpc } from '@/app/apis/base'
import { getAdminSupabase } from '@/app/apis/base/client'

type RefundInput = { requestId: string; amount: number }

export async function refundTokens(input: RefundInput) {
  return wrapService('tasks.refundTokens', async () => {
    const userId = await getCurrentUserId()
    if (!input?.requestId || typeof input.amount !== 'number') {
      throw new Error('잘못된 요청입니다.')
    }

    // increment_balance RPC 사용 (이미 존재)
    await callRpc('increment_balance', { user_id_param: userId, amount_param: input.amount })

    // 거래 기록 추가
    const admin = await getAdminSupabase()
    const { error } = await admin
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: input.amount,
        transaction_type: 'REFUND',
        description: `의뢰 취소 반환 (의뢰 ID: ${input.requestId})`,
        related_user_id: null,
      })
    if (error) throw error

    return { success: true }
  })
}


