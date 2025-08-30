// app/api/notifications/mark-header-read/route.ts
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

    // 헤더에 표시되는 일반 알림 읽음 처리 (메시지, 의뢰 관련 제외)
    // Supabase에서는 not.in을 지원하지 않으므로 개별적으로 not.eq 사용
    const excludedTypes = ['message', 'request', 'accept', 'reject', 'cancel', 'complete']

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    // 각 타입에 대해 not.eq 적용
    excludedTypes.forEach(type => {
      query = query.not('type', 'eq', type)
    })

    const { error } = await query

    if (error) {
      throw createServiceError('헤더 알림 읽음 처리 실패', error)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return handleApiError(error)
  }
}
