// 인기 게임 카테고리를 추천하는 API
// recommended_games_latest 뷰에서 상위 게임들을 가져옴

import { NextRequest, NextResponse } from "next/server"
import { handleApiError, createValidationError } from "@/app/apis/base"
import { categoryPopularGetQuerySchema } from "@/libs/schemas/server/category.schema"
import { svcListPopularGames } from "@/app/apis/service/category/popularService"

export async function GET(request: NextRequest) {
  const rawQuery = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = categoryPopularGetQuerySchema.safeParse(rawQuery)
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors
    throw createValidationError("요청 파라미터가 유효하지 않습니다.", details)
  }
  const { limit } = parsed.data

  try {
    const result = await svcListPopularGames(limit)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
