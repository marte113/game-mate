// app/api/order/provider-reservations/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { Database } from '@/types/database.types';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // 현재 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증 오류가 발생했습니다.' },
        { status: 401 }
      );
    }
    
    // URL에서 providerId 파라미터 가져오기
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    
    if (!providerId) {
      return NextResponse.json(
        { error: '제공자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 제공자의 예약된 의뢰 목록 가져오기 (pending 또는 accepted 상태)
    const { data: orders, error: ordersError } = await supabase
      .from('requests')
      .select('id, scheduled_date, scheduled_time, status')
      .eq('provider_id', providerId)
      .in('status', ['pending', 'accepted']);
    
    if (ordersError) {
      return NextResponse.json(
        { error: '예약 정보를 가져오는데 실패했습니다: ' + ordersError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('예약 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '예약 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}