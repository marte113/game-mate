// app/api/notifications/mark-read/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/supabase/functions/server'
import { handleApiError, createUnauthorizedError, createServiceError, createValidationError } from '@/app/apis/base'
import { markReadPostBodySchema } from '@/libs/schemas/server/notification.schema'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientComponent()
    const json = await request.json()
    const parsed = markReadPostBodySchema.safeParse(json)
    if (!parsed.success) {
      throw createValidationError('요청 바디가 유효하지 않습니다.', parsed.error.flatten().fieldErrors)
    }
    const { notificationId } = parsed.data

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createUnauthorizedError('로그인이 필요합니다')
    }

    // 알림 읽음 처리
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id) // 보안을 위해 사용자 ID 확인

    if (error) {
      throw createServiceError('알림 읽음 처리 실패', error)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return handleApiError(error)
  }
}
