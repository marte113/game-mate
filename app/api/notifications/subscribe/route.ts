// app/api/notifications/subscribe/route.ts
import { NextRequest } from 'next/server'
import { handleApiError, createUnauthorizedError, createServiceError } from '@/app/apis/base'

import { createServerClientComponent } from '@/supabase/functions/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientComponent()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleApiError(createUnauthorizedError('로그인이 필요합니다.'))
    }

    const encoder = new TextEncoder()

    // ReadableStream을 사용한 Server-Sent Events
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        ;(async () => {
          try {
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

            // 주기적 keep-alive 코멘트 전송 (프록시/로드밸런서 타임아웃 방지)
            const keepAlive = setInterval(() => {
              controller.enqueue(encoder.encode(`: keepalive\n\n`))
            }, 15000)

            // 연결 종료 시 정리
            request.signal.addEventListener('abort', () => {
              try { supabase.removeChannel(subscription) } catch {}
              clearInterval(keepAlive)
              controller.close()
            })
          } catch (e) {
            controller.error(e)
          }
        })()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    return handleApiError(createServiceError('SSE 구독 초기화 실패', error))
  }
}
