"use client"

import { type ProfileMainContentProps } from "@/app/profile/_types/profile.types"
import { useUser } from "@/stores/authStore" // isOwner 확인용
import { usePublicProfileQuery } from "@/hooks/api/profile/usePublicProfileQuery"

import ProfileTabNav from "./ProfileTabNav"
import ProfileAlbumBoundary from "./ProfileAlbumBoundary"
import ProfileTags from "./ProfileTags"
import ProfileGameListBoundary from "./ProfileGameListBoundary"
import ProfileInfoSection from "./ProfileInfoSection"
import ProfileVideoSection from "./ProfileVideoSection"
import ProfileReviewSection from "./ProfileReviewSection"
import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import ProfileMainContentSkeleton from "./skeletons/ProfileMainContentSkeleton"

// 탭 종류 정의
export type ProfileTabType = "profile" // | 'videos' | 'reviews'; // 추후 확장

export default function ProfileMainContent({ profileId }: ProfileMainContentProps) {
  const loggedInUser = useUser() // isOwner 확인용

  // Prefetch된 프로필 데이터 가져오기 (하위 컴포넌트에 전달 목적)
  const { data: profileData, isLoading } = usePublicProfileQuery(profileId, {
    enabled: Number.isFinite(profileId),
  })

  // isOwner 계산 (GameList 등에 전달)
  // profileData가 로드된 후에 계산하도록 보장
  const isOwner = !!profileData && loggedInUser?.id === profileData.user_id

  // --- 로딩/에러 처리 ---
  // 기본적인 스켈레톤 또는 메시지 표시
  if (isLoading && !profileData) {
    return <ProfileMainContentSkeleton />
  }
  // 에러 UI는 상위 QuerySectionBoundary에서 처리합니다.
  if (!profileData) return null

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
                <ProfileAlbumBoundary
                  userId={profileData.user_id}
                  profileNickname={profileData.nickname}
                />
              )}
              {/* 태그 */}
              <ProfileTags tags={profileData.selected_tags} />
              {/* 게임 카드 */}
              <ProfileGameListBoundary
                selectedGames={profileData.selected_games}
                isOwner={isOwner}
                // TODO: rating, reviewCount 데이터 전달 필요 (실제 데이터 사용)
                rating={5.0} // 임시 값
                reviewCount={4} // 임시 값 (기존 page.jsx 값)
                providerUserId={profileData.user_id}
              />
            </div>

            {/* 오른쪽 메인 콘텐츠 */}
            <div className="md:col-span-2 space-y-8">
              {/* 소개 */}
              <ProfileInfoSection introduction={profileData.description} />
              {/* 비디오 */}
              <ProfileVideoSection youtubeUrls={profileData.youtube_urls} />
              {/* 리뷰 */}
              <QuerySectionBoundary keys={queryKeys.profile.reviewsByProfileId(profileId)}>
                <ProfileReviewSection profileId={profileId} />
              </QuerySectionBoundary>
            </div>
          </div>

          {/* 다른 탭 컨텐츠 추가 (예: activeTab === 'videos' && <VideoListComponent />) */}
        </div>
      </section>
    </>
  )
}
