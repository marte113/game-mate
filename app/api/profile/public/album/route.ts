import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { handleApiError, createValidationError } from "@/app/apis/base"
import { getAlbumGalleryByUserIdPublic } from "@/app/apis/service/profile/albumService"

// GET /api/profile/public/album?userId=<string>
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const raw = Object.fromEntries(url.searchParams)

    const schema = z.object({
      userId: z
        .string({ required_error: "userId는 필수입니다." })
        .min(1, { message: "userId는 비어 있을 수 없습니다." }),
    })

    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 파라미터가 유효하지 않습니다.", details)
    }

    const { userId } = parsed.data
    const { formatted, thumbnailIndex } = await getAlbumGalleryByUserIdPublic(userId)

    return NextResponse.json({ success: true, data: formatted, thumbnailIndex }, { status: 200 })
  } catch (err) {
    return handleApiError(err)
  }
}
