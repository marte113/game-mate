import 'server-only'

import Link from 'next/link'
import { verifyAndChargeTokens } from '@/app/apis/service/payment/verifyService'
import { paymentVerifyGetQuerySchema } from '@/libs/schemas/server/payment.schema'
import { isServiceError } from '@/app/apis/base'

// 동적 렌더링 강제(캐시 방지)
export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PaymentCompletePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const rawPaymentId = (sp?.paymentId ?? '') as string | string[]
  const paymentId = Array.isArray(rawPaymentId) ? rawPaymentId[0] : rawPaymentId

  const parsed = paymentVerifyGetQuerySchema.safeParse({ paymentId })
  if (!parsed.success) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">결제 결과</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">잘못된 요청</h2>
          <p className="text-red-600">유효한 결제 ID가 필요합니다.</p>
          <div className="mt-4 text-center">
            <Link href="/dashboard?tab=token" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus">대시보드로 이동</Link>
          </div>
        </div>
      </div>
    )
  }

  const secret = process.env.PORTONE_V2_API_SECRET
  if (!secret) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">결제 결과</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">서버 설정 오류</h2>
          <p className="text-red-600">결제 검증 키가 설정되어 있지 않습니다.</p>
          <div className="mt-4 text-center">
            <Link href="/dashboard?tab=token" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus">대시보드로 이동</Link>
          </div>
        </div>
      </div>
    )
  }

  let result: Awaited<ReturnType<typeof verifyAndChargeTokens>> | null = null
  let errorMessage: string | null = null
  let alreadyProcessed = false

  try {
    result = await verifyAndChargeTokens(parsed.data.paymentId, secret)
  } catch (err) {
    let message = '결제 처리 중 오류가 발생했습니다'
    if (err instanceof Error) {
      const anyErr = err as any
      if (anyErr?.name === 'ServiceError' && anyErr.cause instanceof Error) {
        const cause = anyErr.cause as Error
        if ((cause as any)?.name === 'UnauthorizedError') {
          message = '로그인이 만료되었습니다. 다시 로그인 후 결제를 완료해주세요.'
        } else {
          message = cause.message || message
        }
      } else {
        message = err.message
      }
    }
    errorMessage = message
    if (message.includes('이미 처리된 결제')) {
      alreadyProcessed = true
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">결제 결과</h1>

      {errorMessage ? (
        <div className={`${alreadyProcessed ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'} border rounded-md p-4 mb-6`}>
          <h2 className={`text-lg font-semibold mb-2 ${alreadyProcessed ? 'text-amber-700' : 'text-red-700'}`}>
            {alreadyProcessed ? '이미 처리된 결제' : '결제 오류'}
          </h2>
          <p className={`${alreadyProcessed ? 'text-amber-700' : 'text-red-600'}`}>{errorMessage}</p>
          <div className="mt-4 text-center">
            <Link href="/dashboard?tab=token" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus">대시보드로 이동</Link>
          </div>
        </div>
      ) : result?.success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-700">결제 완료</h2>
          </div>

          <div className="bg-white p-4 rounded border mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold">주문명:</div>
              <div>{result.paymentInfo?.orderName || '-'}</div>

              <div className="font-semibold">결제 금액:</div>
              <div>{(result.paymentInfo?.amount ?? 0).toLocaleString()}원</div>

              <div className="font-semibold">충전된 토큰:</div>
              <div className="font-semibold text-primary">{(result.tokenAmount ?? 0).toLocaleString()} 토큰</div>

              <div className="font-semibold">현재 토큰 잔액:</div>
              <div className="font-semibold text-primary">{(result.currentBalance ?? 0).toLocaleString()} 토큰</div>

              <div className="font-semibold">결제 시간:</div>
              <div>{result.paymentInfo?.paidAt ? new Date(result.paymentInfo.paidAt).toLocaleString() : '-'}</div>
            </div>
          </div>

          <p className="text-center text-green-700 mb-4">{result.message}</p>

          <div className="flex justify-center">
            <Link href="/dashboard?tab=token" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-focus">대시보드로 이동</Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">결제 정보를 불러올 수 없습니다.</p>
          <Link href="/dashboard?tab=token" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus">대시보드로 이동</Link>
        </div>
      )}
    </div>
  )
}

