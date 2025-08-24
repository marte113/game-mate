import { NextRequest, NextResponse } from "next/server";
import { verifyAndChargeTokens } from '@/app/apis/service/payment/verifyService'

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('paymentId')
    const secret = process.env.PORTONE_V2_API_SECRET!
    const result = await verifyAndChargeTokens(paymentId || '', secret)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 서버 오류가 발생했습니다'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
