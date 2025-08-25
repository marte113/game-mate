import { NextResponse } from 'next/server'

import { getMyTokenBalance } from '@/app/apis/service/token/balanceService'

export async function GET() {
  try {
    const result = await getMyTokenBalance()
    return NextResponse.json(result)
  } catch (error) {
    console.error("토큰 조회 중 오류 발생:", error)
    return NextResponse.json(
      { success: false, message: "토큰 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
