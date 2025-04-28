import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'

// GET: 사용자가 받은 의뢰 목록 조회
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // 현재 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증 오류가 발생했습니다.' },
        { status: 401 }
      )
    }
    
    // URL에서 status 파라미터 가져오기 (선택적)
    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    
    // 기본 쿼리 빌더
    let query = supabase
      .from('requests')
      .select(`
        *,
        requester:requester_id(id, name, profile_circle_img, is_online)
      `)
      .eq('provider_id', user.id)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
    
    // status 파라미터가 있으면 필터링 추가
    if (statusParam) {
      query = query.eq('status', statusParam)
    }
    
    // 쿼리 실행
    const { data: orders, error: ordersError } = await query
    
    if (ordersError) {
      return NextResponse.json(
        { error: '의뢰 목록을 가져오는데 실패했습니다: ' + ordersError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('의뢰 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '의뢰 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
} 