import { NextResponse } from "next/server"

import { handleApiError, createValidationError } from "@/app/apis/base"
import {
  chatMessagesGetQuerySchema,
  sendMessageBodySchema,
} from "@/libs/schemas/server/messages.schema"
import { getMessagesService, sendMessageService } from "@/app/apis/service/chat/chatRoomService"

export async function GET(request: Request) {
  try {
    // URL에서 roomId 파라미터 검증
    const rawQuery = Object.fromEntries(new URL(request.url).searchParams)
    const parsed = chatMessagesGetQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 파라미터가 유효하지 않습니다.", details)
    }
    const { roomId } = parsed.data

    const result = await getMessagesService(roomId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    // 요청 본문 검증
    const body = await request.json().catch(() => undefined)
    const parsed = sendMessageBodySchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError("요청 본문이 유효하지 않습니다.", details)
    }

    const result = await sendMessageService(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
