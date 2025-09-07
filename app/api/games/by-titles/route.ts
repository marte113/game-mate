import { NextResponse, type NextRequest } from "next/server"

import { handleApiError, createValidationError } from "@/app/apis/base"
import { gamesByTitlesGetQuerySchema } from "@/libs/schemas/server/games.schema"
import { listGamesByDescriptions } from "@/app/apis/repository/category/gamesRepository"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const raw = Object.fromEntries(url.searchParams)
    const parsed = gamesByTitlesGetQuerySchema.safeParse(raw)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 파라미터가 유효하지 않습니다.", details)
    }
    const { titles } = parsed.data
    // selected_games가 한글(설명)에 저장되어 있어 description 컬럼으로 조회
    const games = await listGamesByDescriptions(titles)
    return NextResponse.json({ games })
  } catch (error) {
    return handleApiError(error)
  }
}
