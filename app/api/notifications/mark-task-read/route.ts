// app/api/notifications/mark-task-read/route.ts
import { NextResponse } from 'next/server'

import { createServerClientComponent } from '@/libs/supabase/server'

export async function POST() {
  try {
    const supabase = await createServerClientComponent()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 의뢰 관련 알림 읽음 처리
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .in('type', ['request', 'accept', 'reject', 'cancel', 'complete'])

    if (error) {
      console.error('태스크 알림 읽음 처리 실패:', error)
      return NextResponse.json(
        { error: 'Failed to mark task notifications as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('태스크 알림 읽음 처리 API 에러:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
