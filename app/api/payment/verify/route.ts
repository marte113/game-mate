import { NextRequest, NextResponse } from "next/server";
import { verifyAndChargeTokens } from '@/app/apis/service/payment/verifyService'
import { handleApiError, createValidationError, createServiceError } from '@/app/apis/base'
import { paymentVerifyGetQuerySchema } from '@/libs/schemas/server/payment.schema'

export async function GET(request: NextRequest) {
  try {
    const rawQuery = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = paymentVerifyGetQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
    }
    const { paymentId } = parsed.data
    const secret = process.env.PORTONE_V2_API_SECRET
    if (!secret) {
      throw createServiceError('Payment secret not configured')
    }
    const result = await verifyAndChargeTokens(paymentId, secret)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
