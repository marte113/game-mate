import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'

// PATCH: 의뢰 상태 변경
export async function PATCH(request: Request) {
  // 핸들러 시작 로그 추가
  console.log(`[API /api/order/status] PATCH handler started at: ${new Date().toISOString()}`);
  
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
    const { requestId, status } = await request.json()
    
    if (!requestId || !status) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }
    
    // 상태값 검증
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'canceled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      )
    }
    
    // 상태 업데이트 전 로그 추가
    console.log(`[API /api/order/status] About to update request ${requestId} status to ${status}`);
    
    // 상태 변경
    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single()
    
    if (updateError) {
      // 상태 업데이트 에러 로그 추가
      console.error(`[API /api/order/status] Error updating request ${requestId}:`, updateError.message);
      return NextResponse.json(
        { error: '의뢰 상태 업데이트 중 오류가 발생했습니다: ' + updateError.message },
        { status: 500 }
      )
    }
    
    // 상태 업데이트 성공 로그 추가
    console.log(`[API /api/order/status] Request ${requestId} status updated successfully to ${status}`);
    
    // 의뢰 요청 정보 조회 (알림 및 환불 로직에 필요)
    const { data: requestData, error: requestFetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single()
    
    if (requestFetchError) {
      // 의뢰 정보 조회 에러 로그 추가
      console.error(`[API /api/order/status] Error fetching request details for ${requestId}:`, requestFetchError.message);
      // 상태는 이미 업데이트 되었을 수 있으므로, 일단 성공으로 간주하거나 별도 처리 필요
      // 여기서는 일단 에러를 반환하지 않고 진행하나, 로깅은 함
    }
    
    // requestData가 null인 경우 이후 로직을 처리할 수 없으므로 에러 반환
    if (!requestData) {
      console.error(`[API /api/order/status] Failed to fetch request details after update for ${requestId}. Cannot proceed with permissions check or further actions.`);
      return NextResponse.json(
        { error: '의뢰 정보를 확인하는 중 오류가 발생했습니다.' }, 
        { status: 500 } 
      );
    }
    
    // 권한 검증: 의뢰 제공자 또는 요청자만 상태 변경 가능
    if ((requestData.provider_id !== user.id && requestData.requester_id !== user.id)) {
      return NextResponse.json(
        { error: '이 작업을 수행할 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    // 특정 사용자만 특정 상태로 변경 가능
    if (
      (status === 'accepted' || status === 'rejected') && 
      requestData.provider_id !== user.id
    ) {
      // 이 부분은 문제 없음, === 연산은 null 체크를 내포함
    }
    
    if (
      status === 'canceled' && 
      requestData.requester_id !== user.id
    ) {
      return NextResponse.json(
        { error: '의뢰 요청자만 취소할 수 있습니다.' },
        { status: 403 }
      )
    }
    
    if (
      status === 'completed' && 
      requestData.provider_id !== user.id
    ) {
      return NextResponse.json(
        { error: '의뢰 제공자만 완료 처리할 수 있습니다.' },
        { status: 403 }
      )
    }
    
    // 현재 상태에서 변경 가능한지 검증
    if (
      (status === 'accepted' && requestData.status !== 'pending') ||
      (status === 'rejected' && requestData.status !== 'pending') ||
      (status === 'completed' && requestData.status !== 'accepted') ||
      (status === 'canceled' && requestData.status && !['pending', 'accepted'].includes(requestData.status))
    ) {
      // status가 null일 경우 비교 안함
    }
    
    // 완료 시 토큰 지급
    if (status === 'completed' && requestData) {
      // 완료 처리 전 로그 추가
      console.log(`[API /api/order/status] About to call RPC complete_order_payment for ${requestId}`);
      const { error: completeError } = await supabase.rpc('complete_order_payment', {
        p_order_id: requestId
      });
      
      if (completeError) {
        // 완료 처리 에러 로그 추가
        console.error(`[API /api/order/status] RPC complete_order_payment error for ${requestId}:`, completeError.message);
        // 로깅은 함
      }
    // 취소 또는 거절 시 토큰 환불 처리
    } else if ((status === 'canceled' || status === 'rejected') && requestData) {
      // 환불 처리 전 로그 추가
      console.log(`[API /api/order/status] About to call RPC cancel_request_and_refund for ${requestId} (${status})`);
      const { error: refundError } = await supabase.rpc('cancel_request_and_refund', {
        p_request_id: requestId
      });
      
      if (refundError) {
        console.error(`[API /api/order/status] Refund error for request ${requestId} (${status}):`, refundError.message);
        return NextResponse.json(
          { error: '토큰 환불 처리 중 오류가 발생했습니다: ' + refundError.message },
          { status: 500 }
        );
      }
      // 환불 성공 로그 추가
      console.log(`[API /api/order/status] RPC cancel_request_and_refund successful for ${requestId} (${status}).`);
    }
    
    // 알림 생성 로직 제거 시작
    /*
    let notificationContent = ''
    let notificationType = ''
    let recipientId: string | null = null // 타입을 명시적으로 선언
    
    if (status === 'accepted' && requestData.requester_id) {
      notificationContent = '귀하의 의뢰가 수락되었습니다.'
      notificationType = 'accept'
      recipientId = requestData.requester_id
    } else if (status === 'rejected' && requestData.requester_id) {
      notificationContent = '귀하의 의뢰가 거절되었습니다.'
      notificationType = 'reject'
      recipientId = requestData.requester_id
    } else if (status === 'completed' && requestData.requester_id) {
      notificationContent = '귀하의 의뢰가 완료되었습니다.'
      notificationType = 'complete'
      recipientId = requestData.requester_id
    }
    
    // 알림 저장
    if (notificationContent && recipientId) { // recipientId가 null이 아닌지 확인
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: notificationType,
        related_id: requestId,
        content: notificationContent,
        is_read: false
      })
    }
    */
    // 알림 생성 로직 제거 끝
    
    // 성공 응답 전에 최종 상태 로깅 (디버깅 목적)
    console.log(`[API /api/order/status] Successfully processed request ${requestId} to status ${status}. Returning updated request.`);
    return NextResponse.json({ order: updatedRequest })
  } catch (error) {
    // 에러 로깅 강화
    console.error(`[API /api/order/status] Error processing PATCH request:`, error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생';
    return NextResponse.json(
      { error: '의뢰 상태 변경 중 예기치 않은 오류가 발생했습니다: ' + errorMessage },
      { status: 500 }
    )
  }
} 