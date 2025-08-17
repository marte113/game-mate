//여기에 로직을 구현해서 가져다 사용하는 것으로
//합시다.

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/libs/api/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { Database } from '@/types/database.types';
import { useAuthStore } from '@/stores/authStore'; // Auth 스토어 임포트

// 타입 정의: 훅의 인자 (콜백 대신 내부에서 invalidate 사용)
// interface UseTaskSubscriptionOptions {
//   userId: string | undefined; // 사용자 ID (undefined 가능성 처리)
// }

export function useTaskSubscription(): void { // 인자 제거
  const queryClient = useQueryClient();
  const supabase = createClient();
  const user = useAuthStore((state) => state.user); // 스토어에서 사용자 정보 가져오기
  const userId = user?.id; // 사용자 ID 추출

  useEffect(() => {
    // 사용자 ID가 없으면 구독 설정 안 함
    if (!userId) {
      console.log('[useTaskSubscription] User ID not available, skipping subscription.');
      return;
    }

    console.log(`[useTaskSubscription] Setting up subscription for user: ${userId}`);

    // 데이터베이스 변경 시 실행될 콜백 함수
    const handleDbChange = (payload: any) => {
      console.log('[useTaskSubscription] DB Change detected!', payload);
      // 관련 쿼리를 무효화하여 데이터 리프레시 트리거
      queryClient.invalidateQueries({ queryKey: ['receivedOrders'] });
      queryClient.invalidateQueries({ queryKey: ['requestedOrders'] });
      console.log('[useTaskSubscription] Invalidated queries: receivedOrders, requestedOrders');
    }

    // requests 테이블 변경 감지를 위한 채널 설정
    const channel: RealtimeChannel = supabase
      .channel(`realtime-requests-tasklist-${userId}`) // 사용자별 고유 채널 이름 권장
      .on(
        'postgres_changes',
        {
          event: '*', // 모든 이벤트 (INSERT, UPDATE, DELETE) 감지
          schema: 'public',
          table: 'requests',
          filter: `provider_id=eq.${userId}` // 현재 사용자가 제공자인 경우
        },
        handleDbChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `requester_id=eq.${userId}` // 현재 사용자가 요청자인 경우
        },
        handleDbChange
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[useTaskSubscription] Subscribed successfully for user ${userId}!`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`[useTaskSubscription] Subscription failed or closed for user ${userId}:`, status, err);
        }
      });

    // 컴포넌트 언마운트 시 또는 의존성 변경 시 구독 해제
    return () => {
      console.log(`[useTaskSubscription] Cleaning up subscription for user: ${userId}`);
      if (channel) {
        supabase.removeChannel(channel)
          .then(() => console.log(`[useTaskSubscription] Channel removed successfully for user ${userId}.`))
          .catch(err => console.error(`[useTaskSubscription] Error removing channel for user ${userId}:`, err));
      }
    }
  // 이제 userId를 내부에서 가져오므로, userId가 변경될 때 useEffect가 다시 실행되도록 의존성 배열에 추가
  }, [userId, queryClient, supabase]);

  // 이 훅은 값을 반환하지 않음 (side effect만 처리)
}