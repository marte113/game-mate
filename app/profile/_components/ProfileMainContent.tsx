"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/libs/api/client";
import {
  PrefetchedProfileData,
  ProfileMainContentProps,
} from "@/app/profile/_types/profile.types";
import { useAuthStore } from "@/stores/authStore"; // isOwner 확인용

import ProfileTabNav from "./ProfileTabNav";
import ProfileAlbumCarousel from "./ProfileAlbumCarousel";
import ProfileTags from "./ProfileTags";
import ProfileGameList from "./ProfileGameList";
import ProfileInfoSection from "./ProfileInfoSection";
import ProfileVideoSection from "./ProfileVideoSection";
import ProfileReviewSection from "./ProfileReviewSection";

// 탭 종류 정의
export type ProfileTabType = "profile"; // | 'videos' | 'reviews'; // 추후 확장

// 클라이언트 사이드 데이터 페칭 함수 (ProfileHeader와 동일, 추후 분리 권장)
async function fetchClientProfile(supabase: ReturnType<typeof createClient>, publicProfileId: number): Promise<PrefetchedProfileData | null> {
  console.log(`[Client Fetch] Fetching profile for public_id: ${publicProfileId}`);
  const { data: profileInfo, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, nickname, follower_count, description, selected_tags, youtube_urls, selected_games')
    .eq('public_id', publicProfileId)
    .single();

  if (profileError || !profileInfo || !profileInfo.user_id) {
    console.error(`[Client Fetch] Error fetching profile or profile/user_id not found for public_id ${publicProfileId}:`, profileError);
    return null;
  }

  const { data: userInfo, error: userError } = await supabase
    .from('users')
    .select('id, name, profile_circle_img, is_online')
    .eq('id', profileInfo.user_id)
    .single();

  if (userError || !userInfo) {
    console.error(`[Client Fetch] Error fetching user for user_id ${profileInfo.user_id}:`, userError);
    return null;
  }

  return {
    ...userInfo,
    ...profileInfo,
    user_id: userInfo.id,
    public_id: publicProfileId,
  };
}

export default function ProfileMainContent({
  profileId,
}: ProfileMainContentProps) {
  const { user: loggedInUser } = useAuthStore(); // isOwner 확인용
  const supabase = createClient(); // 클라이언트 컴포넌트용 Supabase 클라이언트 생성

  // Prefetch된 프로필 데이터 가져오기 (하위 컴포넌트에 전달 목적)
  const queryKey = ["profile", profileId];
  const numericProfileId = Number(profileId); // queryFn에서 사용

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery<PrefetchedProfileData | null>({
    queryKey: queryKey,
    queryFn: async () => {
      if (isNaN(numericProfileId)) {
        console.error(`[Client QueryFn] Invalid profileId: ${profileId}`);
        return null;
      }
      return fetchClientProfile(supabase, numericProfileId);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !isNaN(numericProfileId), // 유효한 숫자 ID일 때만 쿼리 활성화
  });

  // isOwner 계산 (GameList 등에 전달)
  // profileData가 로드된 후에 계산하도록 보장
  const isOwner = !!profileData && loggedInUser?.id === profileData.user_id;

  // --- 로딩/에러 처리 ---
  // 기본적인 스켈레톤 또는 메시지 표시
  if (isLoading && !profileData) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            {/* Tab Nav Placeholder */}
            <div className="h-10 bg-base-300 rounded w-1/4 mb-8"></div>
            {/* Content Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="h-48 bg-base-300 rounded"></div>
                <div className="h-24 bg-base-300 rounded"></div>
                <div className="h-32 bg-base-300 rounded"></div>
              </div>
              <div className="md:col-span-2 space-y-8">
                <div className="h-24 bg-base-300 rounded"></div>
                <div className="h-48 bg-base-300 rounded"></div>
                <div className="h-64 bg-base-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="py-8 text-center">
        <p className="text-error">프로필 컨텐츠를 불러오는 중 오류가 발생했습니다.</p>
      </section>
    );
  }
  if (!profileData) {
    return (
      <section className="py-8 text-center">
        <p>프로필 컨텐츠를 찾을 수 없습니다.</p>
      </section>
    );
  }

  return (
    <>
      {/* 탭 네비게이션 */}
      <ProfileTabNav />

      {/* 메인 콘텐츠 영역 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 현재는 'profile' 탭만 존재 */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 왼쪽 사이드바 */}
            <div className="md:col-span-1 space-y-6">
              {/* 앨범 - user_id가 있을 때만 렌더링 */}
              {profileData.user_id && (
                <ProfileAlbumCarousel
                  userId={profileData.user_id} // null 체크는 위에서 profileData 로딩 시 완료됨
                  profileNickname={profileData.nickname}
                />
              )}
              {/* 태그 */}
              <ProfileTags tags={profileData.selected_tags} />
              {/* 게임 카드 */}
              <ProfileGameList
                selectedGames={profileData.selected_games}
                isOwner={isOwner}
                // TODO: rating, reviewCount 데이터 전달 필요 (실제 데이터 사용)
                rating={5.0} // 임시 값
                reviewCount={4} // 임시 값 (기존 page.jsx 값)
              />
            </div>

            {/* 오른쪽 메인 콘텐츠 */}
            <div className="md:col-span-2 space-y-8">
              {/* 소개 */}
              <ProfileInfoSection introduction={profileData.description} />
              {/* 비디오 */}
              <ProfileVideoSection youtubeUrls={profileData.youtube_urls} />
              {/* 리뷰 */}
              <ProfileReviewSection profileId={profileId} />
            </div>
          </div>

          {/* 다른 탭 컨텐츠 추가 (예: activeTab === 'videos' && <VideoListComponent />) */}
        </div>
      </section>
    </>
  );
}
