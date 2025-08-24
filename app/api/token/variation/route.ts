import { NextResponse } from "next/server";
import { getMyMonthlyUsage } from '@/app/apis/service/token/variationService'

export async function GET() {
  try {
    const result = await getMyMonthlyUsage()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching token variation:", error)
    return NextResponse.json(
      { success: false, message: "토큰 사용량 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
