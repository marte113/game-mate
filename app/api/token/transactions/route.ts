import { NextRequest, NextResponse } from "next/server";
import { getMyTokenTransactions } from '@/app/apis/service/token/transactionsService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageParam = searchParams.get('pageParam') ?? undefined
    const limit = Number(searchParams.get('limit') ?? '10')
    const result = await getMyTokenTransactions({ pageParam, limit: Number.isFinite(limit) ? limit : 10 })
    return NextResponse.json(result)
  } catch (error) {
    console.error("토큰 거래 조회 중 오류 발생:", error)
    return NextResponse.json(
      { success: false, message: "토큰 거래 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
