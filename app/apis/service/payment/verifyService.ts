import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { findPaymentByExternalId, upsertPaymentFromPortOne, insertTokenChargeTransaction, getUserTokenBalance, upsertUserTokenBalance } from '@/app/apis/repository/payment/paymentRepository'

export async function verifyAndChargeTokens(paymentId: string, portOneSecret: string) {
  return wrapService('payment.verifyAndChargeTokens', async () => {
    if (!paymentId) throw new Error('결제 ID가 없습니다')
    const userId = await getCurrentUserId()

    const portOneRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${portOneSecret}`, 'Content-Type': 'application/json' },
    })
    if (!portOneRes.ok) {
      let errorData: any = null
      try { errorData = await portOneRes.json() } catch {}
      throw new Error('결제 정보 조회에 실패했습니다')
    }
    const payment = await portOneRes.json()
    if (payment.status !== 'PAID') {
      throw new Error(`결제가 완료되지 않았습니다 (상태: ${payment.status})`)
    }

    // 멱등성 체크
    const existing = await findPaymentByExternalId(payment.id)
    if (existing && existing.status === 'PAID') {
      throw new Error('이미 처리된 결제입니다.')
    }

    const paymentData = await upsertPaymentFromPortOne(payment)

    const tokenAmount = payment.orderName?.startsWith('token-')
      ? parseInt(payment.orderName.split('-')[1])
      : 0

    await insertTokenChargeTransaction({
      userId,
      amount: tokenAmount,
      paymentId: paymentData.payment_id,
      description: `토큰 ${tokenAmount}개 충전 (결제 ID: ${payment.id})`,
    })

    const currentBalance = await getUserTokenBalance(userId)
    const updated = await upsertUserTokenBalance(userId, currentBalance + tokenAmount)

    return {
      success: true,
      message: '결제가 완료되었습니다',
      paymentInfo: {
        id: payment.id,
        orderName: payment.orderName,
        status: payment.status,
        amount: payment.amount?.total || 0,
        paidAt: payment.paidAt,
      },
      tokenAmount,
      currentBalance: updated.balance,
    }
  })
}


