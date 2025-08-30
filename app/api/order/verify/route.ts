import { NextRequest, NextResponse } from 'next/server'
import { getMessagesAndMarkRead, createOrderWithPayment } from '@/app/apis/service/order/verifyService'
import { handleApiError, createValidationError } from '@/app/apis/base'
import { verifyOrderGetQuerySchema, verifyOrderPostBodySchema } from '@/libs/schemas/server/order.schema'

export async function GET(request: NextRequest) {
  try {
    const rawQuery = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = verifyOrderGetQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
    }
    const { roomId } = parsed.data
    const result = await getMessagesAndMarkRead(roomId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => undefined)
    const parsed = verifyOrderPostBodySchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 본문이 유효하지 않습니다.', details)
    }
    const result = await createOrderWithPayment(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}



