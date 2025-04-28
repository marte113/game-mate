import { ReactNode } from "react";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
// orderApi와 query key 경로 확인 필요
import { orderApi } from '@/app/dashboard/_api/orderApi';
// import { ChatQueryKeys } from '@/app/dashboard/chat/_api'; // 필요시 키 임포트 (여기서는 orderApi 가정)

// 서버 컴포넌트로 변경
export default async function TaskPageContainer({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  // --- Prefetching Logic ---
  // 중요: orderApi 함수들이 서버 환경에서 실행 가능해야 함
  // (Supabase 클라이언트 인스턴스를 인자로 받거나 내부적으로 생성)

  // getReceivedOrders prefetch
  await queryClient.prefetchQuery({
    queryKey: ['receivedOrders'], // TaskList의 useQuery와 동일한 키
    queryFn: () => orderApi.getReceivedOrders(/* 필요시 서버용 supabase 인스턴스 전달 */)
  });

  // getRequestedOrders prefetch (리뷰 플래그 포함 버전)
  await queryClient.prefetchQuery({
    queryKey: ['requestedOrders'], // TaskList의 useQuery와 동일한 키
    queryFn: () => orderApi.getRequestedOrders(/* 필요시 서버용 supabase 인스턴스 전달 */)
     // 만약 orderApi.getRequestedOrders가 리뷰 플래그 로직을 포함하지 않는다면,
     // 여기에 직접 Supabase 쿼리 및 데이터 가공 로직을 넣어야 함 (이전 page.jsx 예시 참고)
     /* 예시 (orderApi 미사용 시):
     queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');
        const { data: ordersData, error } = await supabase
          .from('requests')
          .select(`*, provider:provider_id(id, name, profile_circle_img, is_online), reviews!left(id)`)
          .eq('requester_id', user.id)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true });
        if (error) throw new Error(error.message);
        const orders = (ordersData as any[])?.map(order => ({
          ...order,
          has_review: order.reviews && Array.isArray(order.reviews) && order.reviews.length > 0
        })) || [];
        return { orders };
     }
     */
  });
  // --- End Prefetching Logic ---

  const dehydratedState = dehydrate(queryClient);

  return (
    // HydrationBoundary로 children(TaskList)을 감싸서 전달
    <div className="w-full">
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
    </div>
  );
}
