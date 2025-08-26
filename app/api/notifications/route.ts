// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/libs/supabase/server'
import { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

export async function GET() {
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

    // 알림 데이터 조회
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('알림 조회 실패:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    // 읽지 않은 알림 집계 계산
    const unreadNotifications = notifications?.filter(n => !n.is_read) || []
    const unreadCount = {
      total: unreadNotifications.length,
      message: unreadNotifications.filter(n => n.type === 'message').length,
      request: unreadNotifications.filter(n =>
        ['request', 'accept', 'reject', 'cancel', 'complete'].includes(n.type || '')
      ).length,
      follow: unreadNotifications.filter(n => n.type === 'follow').length
    }

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount
    })

  } catch (error) {
    console.error('알림 API 에러:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
