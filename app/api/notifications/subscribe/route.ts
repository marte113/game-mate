// app/api/notifications/subscribe/route.ts
import { NextRequest } from 'next/server'

import { createServerClientComponent } from '@/libs/supabase/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  // ReadableStream을 사용한 Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      ;(async () => {
        try {
          const supabase = await createServerClientComponent()

          // 현재 사용자 확인
          const { data: { user }, error: authError } = await supabase.auth.getUser()

          if (authError || !user) {
            controller.error(new Error('Unauthorized'))
            return
          }

          // 실시간 알림 구독
          const subscription = supabase
            .channel(`notifications:${user.id}`)
            .on('postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
              },
              () => {
                // 알림 업데이트 이벤트 전송
                const message = `data: notification_update\n\n`
                controller.enqueue(encoder.encode(message))
              }
            )
            .subscribe()

          // 연결 종료 시 정리
          request.signal.addEventListener('abort', () => {
            supabase.removeChannel(subscription)
            controller.close()
          })

        } catch (error) {
          controller.error(error)
        }
      })()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
