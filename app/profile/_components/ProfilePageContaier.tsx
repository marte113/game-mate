import { ReactNode } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { createServerClientComponent } from '@/libs/api/server';
import { PrefetchedProfileData } from '@/app/profile/_types/profile.types';

// 컴포넌트 Props 타입 정의
interface ProfilePageContainerProps {
  profileId: string; // 조회할 프로필의 ID
  children: ReactNode;
}

// --- 타입 정의 제거 ---
// type PublicProfile = Pick< ... >;

async function fetchProfileData(supabase: Awaited<ReturnType<typeof createServerClientComponent>>, publicProfileId: number): Promise<PrefetchedProfileData | null> {
  console.log(`[Server] Fetching profile for public_id: ${publicProfileId}`);
  const { data: profileInfo, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, nickname, follower_count, description, selected_tags, youtube_urls, selected_games') // selected_games 추가
    .eq('public_id', publicProfileId)
    .single();

  if (profileError || !profileInfo) {
    console.error(`[Server] Error fetching profile or profile not found for public_id ${publicProfileId}:`, profileError);
    return null;
  }

  // user_id가 null이면 더 이상 진행하지 않음
  if (!profileInfo.user_id) {
    console.error(`[Server] User ID not found in profile for public_id ${publicProfileId}`);
    return null;
  }

  const { data: userInfo, error: userError } = await supabase
    .from('users')
    .select('id, name, profile_circle_img, is_online')
    .eq('id', profileInfo.user_id) // 이제 profileInfo.user_id는 string 타입으로 간주됨 (null 체크 위에서 함)
    .single();

  if (userError || !userInfo) {
    console.error(`[Server] Error fetching user or user not found for user_id ${profileInfo.user_id}:`, userError);
    // 여기서 null을 반환하면 프로필 정보의 일부만 있어도 null 처리됨. 정책에 따라 달라질 수 있음.
    return null;
  }

  console.log(`[Server] Profile data fetched successfully for public_id: ${publicProfileId}`);
  return {
    ...userInfo,
    ...profileInfo,
    // user_id는 profileInfo에서 오지만, UsersRow 타입과 맞추기 위해 userInfo의 id를 우선할 수 있음 (같은 값이여야 함)
    user_id: userInfo.id, // userInfo.id 사용 (non-null 보장)
    public_id: publicProfileId,
  };
}

export default async function ProfilePageContainer({
  profileId,
  children,
}: ProfilePageContainerProps) {
  const queryClient = new QueryClient();
  const supabase = await createServerClientComponent();
  const numericProfileId = Number(profileId);
  const queryKey = ['profile', profileId];

  await queryClient.prefetchQuery<PrefetchedProfileData | null>({
    queryKey: queryKey,
    queryFn: async () => {
      if (isNaN(numericProfileId)) {
        console.error(`[Server] Invalid profileId: ${profileId}`);
        return null;
      }
      return fetchProfileData(supabase, numericProfileId);
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

