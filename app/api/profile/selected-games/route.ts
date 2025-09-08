import { NextRequest, NextResponse } from "next/server"

import { handleApiError, createValidationError } from "@/app/apis/base"
import { getProfileByUserId } from "@/app/apis/repository/profile/profilesRepository"
import { profileSelectedGamesGetQuerySchema } from "@/libs/schemas/server/profile.schema"

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(new URL(req.url).searchParams)
    const parsed = profileSelectedGamesGetQuerySchema.safeParse(raw)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 파라미터가 유효하지 않습니다.", details)
    }
    const { userId } = parsed.data

    const profile = await getProfileByUserId(userId)
    const selectedGames = profile?.selected_games ?? []
    return NextResponse.json({ selectedGames })
  } catch (error) {
    return handleApiError(error)
  }
}
