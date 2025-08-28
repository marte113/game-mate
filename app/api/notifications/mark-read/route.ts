// app/api/notifications/mark-read/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/supabase/functions/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientComponent()
    const { notificationId } = await request.json()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 알림 읽음 처리
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id) // 보안을 위해 사용자 ID 확인

    if (error) {
      console.error('알림 읽음 처리 실패:', error)
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('알림 읽음 처리 API 에러:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
