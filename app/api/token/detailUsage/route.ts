import { NextRequest, NextResponse } from "next/server";
import { getMyDetailUsage } from '@/app/apis/service/token/detailUsageService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageParam = searchParams.get('pageParam') ?? undefined
    const limit = Number(searchParams.get('limit') ?? '20')
    const result = await getMyDetailUsage({ pageParam, limit: Number.isFinite(limit) ? limit : 20 })
    return NextResponse.json(result)
  } catch (error) {
    console.error("토큰 조회 중 오류 발생:", error)
    return NextResponse.json(
      { success: false, message: "토큰 거래 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

