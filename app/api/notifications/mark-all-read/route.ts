// app/api/notifications/mark-all-read/route.ts
import { NextResponse } from 'next/server'

import { createServerClientComponent } from '@/supabase/functions/server'

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

    // 모든 알림 읽음 처리
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('모든 알림 읽음 처리 실패:', error)
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('모든 알림 읽음 처리 API 에러:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
