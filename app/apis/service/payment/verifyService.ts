import 'server-only'

import {
  wrapService,
  createBadRequestError,
  createForbiddenError,
  createValidationError,
} from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { callRpc } from '@/app/apis/base/rpc'
import {
  findPaymentByExternalId,
  upsertPaymentFromPortOne,
  insertTokenChargeTransaction,
} from '@/app/apis/repository/payment/paymentRepository'

export async function verifyAndChargeTokens(paymentId: string, portOneSecret: string) {
  return wrapService('payment.verifyAndChargeTokens', async () => {
    console.log("verifyAndChargeTokens 시작");
    if (!paymentId)  {
      console.log("결제 ID가 없습니다");
      throw createBadRequestError('결제 ID가 없습니다')
    }
    const userId = await getCurrentUserId()
    

    const portOneRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${portOneSecret}`, 'Content-Type': 'application/json' },
    })
    if (!portOneRes.ok) {
      // PortOne 응답 실패 시 상세는 로깅 대상이지만, 클라이언트에는 일반 메시지 반환
      console.log("portOneRes.ok :", portOneRes.ok);
      throw createValidationError('결제 정보 조회에 실패했습니다')
    }
    const payment = await portOneRes.json()
    console.log("payment :", payment);
    if (payment.status !== 'PAID') {
      throw createValidationError(`결제가 완료되지 않았습니다 (상태: ${payment.status})`)
    }

    // 소유권 바인딩 검증: PortOne 응답의 customerId 또는 customData.userId가 로그인 사용자와 일치해야 함
    let customDataUserId: string | undefined
    try {
      const cd = payment?.customData
      if (typeof cd === 'string') {
        const s = cd.trim()
        if (s) {
          try {
            const parsed = JSON.parse(s)
            customDataUserId = parsed?.userId ?? parsed?.user_id
          } catch {}
        }
      } else if (cd && typeof cd === 'object') {
        customDataUserId = cd?.userId ?? cd?.user_id
      }
    } catch {}
    const customerUserId: string | undefined =
      payment?.customer?.customerId || payment?.customer?.id || payment?.customerId

    const ownerMatches = customerUserId === userId || customDataUserId === userId
    if (!ownerMatches) {
      throw createForbiddenError('결제 소유자 정보가 현재 사용자와 일치하지 않습니다')
    }

    // 결제 응답 교차검증: 통화/수단/PG
    const allowedPgProviders = new Set<string>(['TOSSPAYMENTS'])
    const currencyOk = payment.currency === 'KRW'
    const methodType: string | undefined = payment?.method?.type
    const methodOk = !!methodType && (
      methodType === 'CARD' ||
      methodType === 'PaymentMethodCard' ||
      /CARD/i.test(methodType)
    )
    const pgProviderRaw = payment?.channel?.pgProvider ?? payment?.channel?.name ?? payment?.method?.provider
    const pgProviderNorm = typeof pgProviderRaw === 'string' ? pgProviderRaw.toUpperCase() : ''
    const channelTypeRaw: string | undefined = payment?.channel?.type ?? (payment as any)?.channelType ?? (payment as any)?.type
    const receiptUrl: string | undefined = (payment as any)?.receiptUrl
    const isSandbox = /TEST/i.test(channelTypeRaw ?? '') || /sandbox/i.test(receiptUrl ?? '')
    const isTossByName = /TOSS/i.test(pgProviderNorm) || /토스/i.test(String(pgProviderRaw ?? ''))
    const isTossByDomain = /tosspayments\.com/i.test(receiptUrl ?? '')
    const pgOk = isSandbox || allowedPgProviders.has(pgProviderNorm) || isTossByName || isTossByDomain

    console.log('결제 검증 체크', {
      currency: payment.currency,
      currencyOk,
      methodType,
      methodOk,
      channelType: payment?.channel?.type,
      channelTypeRaw,
      pgProviderRaw,
      pgProviderNorm,
      receiptUrl,
      isSandbox,
      pgOk,
    })

    console.log("70번 코드까지 완료");
    const fail = !currencyOk || (!isSandbox && (!methodOk || !pgOk))
    if (fail) {
      console.log("74번 분기문에 들어옴");
      throw createValidationError('결제 수단 또는 PG 정보가 올바르지 않습니다')
    }

    // 멱등성 체크
    const existing = await findPaymentByExternalId(payment.id)
    console.log("79번 코드까지 완료");
    if (existing && existing.status === 'PAID') {
      console.log("82번 분기문 들어옴");
      throw createValidationError('이미 처리된 결제입니다.')
    }

    const paymentData = await upsertPaymentFromPortOne(payment)
    console.log("86번 코드까지 완료");

    // 금액 → 토큰 매핑(서버 기준). 클라이언트 표시 문자열(orderName) 파싱은 사용하지 않음.
    const PRICE_TO_TOKEN: Record<number, number> = {
      200: 500,
      9360: 1000,
      18720: 2000,
      45600: 5000,
      91200: 10000,
      266400: 30000,
      444000: 50000,
    }
    const paidTotal: number | undefined = payment?.amount?.total
    if (!paidTotal || typeof paidTotal !== 'number') {
    console.log("100번 분기문 들어옴");

      throw createValidationError('결제 금액 정보가 없습니다')
    }
    const tokenAmount = PRICE_TO_TOKEN[paidTotal]
    console.log("105번 코드까지 완료");

    if (!tokenAmount) {
    console.log("108번 분기문 들어옴");
      throw createValidationError('지원하지 않는 결제 금액입니다')
    }

    await insertTokenChargeTransaction({
      userId,
      amount: tokenAmount,
      paymentId: paymentData.payment_id,
      description: `토큰 ${tokenAmount}개 충전 (결제 ID: ${payment.id})`,
    })
    console.log("118번 코드까지 완료");

    // 잔액 원자적 증가: Supabase RPC 사용
    const updatedBalance = await callRpc('increment_balance', {
      user_id_param: userId,
      amount_param: tokenAmount,
    })
    console.log("126번 코드까지 완료");
    console.log("이 다음이 최종");

    return {
      success: true,
      message: '결제가 완료되었습니다',
      paymentInfo: {
        id: payment.id,
        orderName: payment.orderName,
        status: payment.status,
        amount: payment.amount?.total || 0,
        paidAt: payment.paidAt,
        receiptUrl,
      },
      tokenAmount,
      currentBalance: updatedBalance,
    }
  })
}
