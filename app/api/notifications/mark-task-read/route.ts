// app/api/notifications/mark-task-read/route.ts
import { NextResponse } from 'next/server'

import { createServerClientComponent } from '@/supabase/functions/server'
import { handleApiError, createUnauthorizedError, createServiceError } from '@/app/apis/base'

export async function POST() {
  try {
    const supabase = await createServerClientComponent()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createUnauthorizedError('로그인이 필요합니다')
    }

    // 의뢰 관련 알림 읽음 처리
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .in('type', ['request', 'accept', 'reject', 'cancel', 'complete'])

    if (error) {
      throw createServiceError('태스크 알림 읽음 처리 실패', error)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return handleApiError(error)
  }
}
