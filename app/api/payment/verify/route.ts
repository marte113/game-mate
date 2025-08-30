import { NextRequest, NextResponse } from "next/server";
import { verifyAndChargeTokens } from '@/app/apis/service/payment/verifyService'
import { handleApiError, createBadRequestError, createServiceError } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('paymentId')
    if (!paymentId) {
      throw createBadRequestError('paymentId is required')
    }
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
