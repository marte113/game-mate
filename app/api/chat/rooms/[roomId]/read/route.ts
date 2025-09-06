import { NextResponse } from "next/server"

import { handleApiError, createValidationError } from "@/app/apis/base"
import { chatRoomParamsSchema } from "@/libs/schemas/server/chat.schema"
import { markAsReadService } from "@/app/apis/service/chat/chatRoomService"

interface RouteParams {
  params: Promise<{ roomId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const rawParams = await params
    const parsed = chatRoomParamsSchema.safeParse(rawParams)
    if (!parsed.success) {
      throw createValidationError("잘못된 경로 파라미터", parsed.error.flatten().fieldErrors)
    }
    const { roomId } = parsed.data

    const result = await markAsReadService(roomId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
