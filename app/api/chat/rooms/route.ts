// app/api/chat/rooms/route.ts
import { NextResponse } from "next/server"

import { handleApiError } from "@/app/apis/base"
import { getChatRoomsService } from "@/app/apis/service/chat/chatRoomService"

export async function GET(): Promise<NextResponse> {
  try {
    const result = await getChatRoomsService()
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
