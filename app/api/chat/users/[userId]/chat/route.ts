import { NextResponse } from "next/server"

import { handleApiError, createValidationError } from "@/app/apis/base"
import { chatUserParamsSchema } from "@/libs/schemas/server/chat.schema"
import { findOrCreateChatWithUserService } from "@/app/apis/service/chat/chatRoomService"

interface RouteParams {
  params: Promise<{ userId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const rawParams = await params
    const parsed = chatUserParamsSchema.safeParse(rawParams)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 경로 파라미터가 유효하지 않습니다.", details)
    }
    const { userId } = parsed.data

    const result = await findOrCreateChatWithUserService({ userId })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
