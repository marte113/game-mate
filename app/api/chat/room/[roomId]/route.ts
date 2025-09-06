// app/api/chat/room/[roomId]/route.ts
import { NextResponse } from "next/server"

import { handleApiError, createValidationError } from "@/app/apis/base"
import { chatRoomParamsSchema } from "@/libs/schemas/server/chat.schema"
import { getChatRoomService } from "@/app/apis/service/chat/chatRoomService"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse> {
  try {
    const rawParams = await params
    const parsed = chatRoomParamsSchema.safeParse(rawParams)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 경로 파라미터가 유효하지 않습니다.", details)
    }
    const { roomId } = parsed.data

    const result = await getChatRoomService(roomId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
