import { ReactNode } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { PrefetchedProfileData } from '@/app/profile/_types/profile.types';
import { svcGetPublicProfile } from '@/app/apis/service/profile/profile.service.server';
import { queryKeys } from '@/constants/queryKeys';

// 컴포넌트 Props 타입 정의
interface ProfilePageContainerProps {
  profileId: string; // 조회할 프로필의 ID
  children: ReactNode;
}

export default async function ProfilePageContainer({
  profileId,
  children,
}: ProfilePageContainerProps) {
  const queryClient = new QueryClient();
  const numericProfileId = Number(profileId);
  const key = queryKeys.profile.publicById(numericProfileId);

  await queryClient.prefetchQuery<PrefetchedProfileData | null>({
    queryKey: key,
    queryFn: async () => {
      if (!Number.isFinite(numericProfileId)) return null;
      return svcGetPublicProfile(numericProfileId);
    },
    // 필요시 staleTime 등 옵션 추가
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <main className="min-h-screen bg-base-100">
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
    </main>
  );
}

