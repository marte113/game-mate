import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    // URL에서 roomId 파라미터 가져오기
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    
    if (!roomId) {
      return NextResponse.json({ error: '채팅방 ID가 필요합니다' }, { status: 400 })
    }
    
    // 현재 사용자 확인
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: '인증 오류' }, { status: 401 })
    }
    
    // 메시지 가져오기
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }
    
    // 자동으로 읽음 처리
    const userId = userData.user.id
    await supabase.rpc('mark_messages_as_read', {
      p_chat_room_id: roomId,
      p_user_id: userId
    })
    
    return NextResponse.json({ messages: messagesData || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : '메시지를 가져오는 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    // 현재 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증 오류가 발생했습니다.' },
        { status: 401 }
      )
    }
    
    // 요청 데이터 파싱
    const { providerId, game, scheduledDate, scheduledTime, price } = await request.json()
    
    if (!providerId || !game || !scheduledDate || !scheduledTime || typeof price !== 'number') {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }
    
    // 사용자 토큰 잔액 확인
    const { data: userTokenData, error: userTokenError } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', user.id)
      .single()
    
    if (userTokenError) {
      return NextResponse.json(
        { error: '사용자 토큰 정보를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    // 토큰 잔액 검증
    if (!userTokenData || userTokenData.balance < price) {
      return NextResponse.json(
        { error: '토큰이 부족합니다. 충전 후 다시 시도해주세요.' },
        { status: 400 }
      )
    }
    
    // 트랜잭션 시작: 주문 생성 및 토큰 차감
    const { data: order, error: transactionError } = await supabase.rpc('create_order_with_payment', {
      p_requester_id: user.id,
      p_provider_id: providerId,
      p_game: game,
      p_scheduled_date: scheduledDate,
      p_scheduled_time: scheduledTime,
      p_price: price
    })
    
    if (transactionError) {
      return NextResponse.json(
        { error: '의뢰 생성 중 오류가 발생했습니다: ' + transactionError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ order })
  } catch (error) {
    console.error('의뢰 생성 오류:', error)
    return NextResponse.json(
      { error: '의뢰 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}



