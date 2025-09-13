import { NextResponse, type NextRequest } from "next/server"

import { handleApiError, createValidationError } from "@/app/apis/base"
import { profileSearchGetQuerySchema } from "@/libs/schemas/server/profile.schema"
import { searchProfilesByQuery } from "@/app/apis/repository/profile/searchRepository"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const raw = Object.fromEntries(url.searchParams)

    const parsed = profileSearchGetQuerySchema.safeParse(raw)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 파라미터가 유효하지 않습니다.", details)
    }

    const q = parsed.data.q
    const limit = Math.max(1, Math.min(20, Number(url.searchParams.get("limit") || "8")))

    const items = await searchProfilesByQuery(q, limit)
    return NextResponse.json({ items })
  } catch (error) {
    return handleApiError(error)
  }
}
