import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'

// GET: 사용자가 신청한 의뢰 목록 조회 (리뷰 작성 여부 포함)
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
    // const url = new URL(request.url)
    // const statusParam = url.searchParams.get('status')
    
    // 기본 쿼리 빌더: requests 테이블과 users(provider) 정보를 가져오고,
    // 현재 사용자가 해당 request에 대해 리뷰를 작성했는지 여부(has_review)를 확인
    const query = supabase
      .from('requests')
      .select(`
        *,
        provider:provider_id(id, name, profile_circle_img, is_online),
        reviews!left(id) // <-- left join으로 reviews 테이블의 id만 가져옴
      `)
      .eq('requester_id', user.id)
      // status 파라미터가 있으면 필터링 추가 (필요시 활성화)
      // if (statusParam) {
      //  query = query.eq('status', statusParam)
      // }
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
    
    // 쿼리 실행
    const { data: ordersData, error: ordersError } = await query
    
    if (ordersError) {
      return NextResponse.json(
        { error: '의뢰 목록을 가져오는데 실패했습니다: ' + ordersError.message },
        { status: 500 }
      )
    }

    // 데이터 가공: reviews 배열의 존재 여부로 has_review 플래그 생성
    const orders = (ordersData as any[])?.map(order => ({
      ...order,
      // reviews 배열이 비어있지 않고 id가 존재하면 리뷰가 있는 것으로 간주
      // order.reviews가 배열인지, null이 아닌지, 길이가 0보다 큰지 확인
      has_review: order.reviews && Array.isArray(order.reviews) && order.reviews.length > 0
    })) || []
    
    // 가공된 데이터 반환
    return NextResponse.json({ orders })

  } catch (error) {
    console.error('신청한 의뢰 목록 조회 오류:', error) // 로그 메시지 구체화
    const message = error instanceof Error ? error.message : '알 수 없는 오류 발생'
    return NextResponse.json(
      { error: '의뢰 목록을 가져오는데 실패했습니다: ' + message }, // 에러 메시지 구체화
      { status: 500 }
    )
  }
} 