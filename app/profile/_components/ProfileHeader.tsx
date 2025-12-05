"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Star, MessageCircle, Heart, Share2 } from "lucide-react"
import { toast } from "react-hot-toast"

import { useUser } from "@/stores/authStore"
import { useChatStore } from "@/stores/chatStore"
import Badge from "@/components/ui/Badge" // Badge 컴포넌트 경로 확인
import { ProfileHeaderProps } from "@/app/profile/_types/profile.types"
import { usePublicProfileQuery } from "@/hooks/api/profile/usePublicProfileQuery"
import { useStartChat } from "@/hooks/chat/useStartChat"
import { buildLoginUrl, getCurrentPathWithSearch } from "@/utils/navigation/loginRedirect"

import ProfileHeaderSkeleton from "./skeletons/ProfileHeaderSkeleton"

// --- 임시 Mock 데이터 (필요시 제거) ---
const mockProfileDataExtras = {
  coverImage: "/profilebg/neonlaserbg.avif",
  badgeLevel: "레전드", // Prefetched 데이터에 없으므로 임시 처리
  rating: 5.0, // Prefetched 데이터에 없으므로 임시 처리
}
// --- 임시 Mock 데이터 끝 ---

// 클라이언트 직접 페칭 로직 제거 (API+Service+Hook 레이어 사용)

export default function ProfileHeader({ profileId }: ProfileHeaderProps) {
  const router = useRouter()
  const loggedInUser = useUser() // 로그인한 사용자 정보
  const { isLoading: chatLoading } = useChatStore()
  const { startChatWithUser } = useStartChat()

  // Prefetch된 프로필 데이터 가져오기
  const { data: profileData, isLoading } = usePublicProfileQuery(profileId, {
    enabled: Number.isFinite(profileId),
  })

  // --- 로딩 및 에러 처리 (헤더 부분에 간단히 표시하거나, page.tsx 레벨에서 처리) ---
  // 이 컴포넌트 자체에서 로딩/에러를 크게 처리하기보다, 데이터가 없을 경우 UI가 깨지지 않도록 방어적으로 코딩

  const isOwner = loggedInUser?.id === profileData?.user_id

  // 채팅 시작 핸들러 (기존 로직 유지)
  const handleStartChat = async () => {
    await startChatWithUser(profileData?.user_id)
  }

  // 팔로우 핸들러 (추후 구현)
  const handleFollow = () => {
    // TODO: 팔로우 API 연동 (useMutation 사용)
    console.log("Follow button clicked")
    toast("팔로우 기능은 준비 중입니다.")
  }

  // 공유 핸들러 (추후 구현)
  const handleShare = () => {
    // TODO: 공유 기능 구현 (navigator.share 또는 링크 복사)
    console.log("Share button clicked")
    toast("공유 기능은 준비 중입니다.")
  }

  // 프로필 수정 핸들러 (추후 구현)
  const handleEditProfile = () => {
    // TODO: 프로필 수정 페이지로 이동 또는 모달
    console.log("Edit profile button clicked")
    router.push("/dashboard?tab=profile")
  }

  // --- 렌더링 로직 ---
  // 데이터 로딩 중이거나 에러 발생 시 기본적인 스켈레톤 또는 메시지 표시 고려
  if (isLoading && !profileData) {
    // 초기 로딩 상태 강화 (hydrate된 데이터가 없을 때만)
    return <ProfileHeaderSkeleton />
  }

  // 에러 UI는 상위 QuerySectionBoundary에서 처리합니다.

  // 데이터가 없는 경우: 렌더 보호용 가드 -> 실행되지는 않지만 진짜 혹시 모를 렌더링 가드.
  if (!profileData) return null

  // --- 실제 UI 렌더링 ---
  return (
    <section className="relative">
      {/* 커버 이미지 */}
      <div className="relative w-full h-48 md:h-64 lg:h-80">
        <Image
          src={mockProfileDataExtras.coverImage} // TODO: 실제 커버 이미지 데이터 사용
          alt="커버 이미지"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* 프로필 정보 */}
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 프로필 이미지 */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-base-100 bg-base-100">
            <Image
              src={profileData.profile_circle_img || "/avatar/avatar_9.jpeg"} // 기본 이미지 제공
              alt={profileData.nickname || profileData.name || "프로필 이미지"}
              fill
              className="object-cover overflow-hidden rounded-full"
              priority={false} // LCP 아닐 가능성 높음
            />
            {/* 온라인 상태 표시기 */}
            <div className="absolute bottom-4 right-1 md:bottom-5 md:right-2 transform -translate-x-1/2 translate-y-1/2 z-20">
              {profileData.is_online ? (
                <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md">
                  <span className="sr-only">온라인</span>
                </div>
              ) : (
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md">
                  <span className="sr-only">오프라인</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 pt-2 md:pt-16">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div>
                <span className="text-2xl md:text-3xl font-bold">
                  {profileData.nickname || profileData.name || "사용자"}
                </span>
                {/* username은 DB에 따라 표시 여부 결정 */}
                {/* <span className="text-sm text-base-content/70 pl-2">{profileData.name}</span> */}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {" "}
                  {/* flex-wrap 추가 */}
                  <div className="flex items-center gap-0.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">
                      {/* TODO: 평점 데이터 가져오기 */}
                      {mockProfileDataExtras.rating.toFixed(1)}
                    </span>
                  </div>
                  {/* TODO: 뱃지 레벨 데이터 가져오기 */}
                  <Badge level={mockProfileDataExtras.badgeLevel} />
                  <div className="text-sm text-base-content/70">
                    팔로워 {profileData.follower_count?.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="flex gap-2 mt-3 md:mt-0 md:ml-auto">
                {isOwner ? (
                  <button
                    className="btn btn-sm btn-outline rounded-full"
                    onClick={handleEditProfile}
                  >
                    프로필 수정
                  </button>
                ) : loggedInUser ? (
                  <>
                    <button className="btn btn-sm btn-outline rounded-full" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="btn btn-sm btn-outline rounded-full" onClick={handleFollow}>
                      <Heart className="w-4 h-4" />
                      {/* TODO: 팔로우 상태에 따라 텍스트 변경 */}
                      팔로우
                    </button>
                    <button
                      className="btn btn-sm btn-primary rounded-full"
                      onClick={handleStartChat}
                      disabled={chatLoading}
                    >
                      <MessageCircle className="w-4 h-4" />
                      1:1 대화
                      {chatLoading && (
                        <span className="loading loading-spinner loading-xs ml-1"></span>
                      )}
                    </button>
                  </>
                ) : (
                  // 로그인 안 한 경우
                  <button
                    className="btn btn-sm btn-primary rounded-full"
                    onClick={() => {
                      const nextPath = getCurrentPathWithSearch()
                      router.push(buildLoginUrl(nextPath))
                    }}
                  >
                    로그인 후 대화
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
