import type { Database } from "@/types/database.types"
import type {
  UsersRow,
  ProfilesRow,
  Album_imagesRow,
  ReviewsRow,
} from "@/types/database.table.types"

// 공개 프로필 데이터 타입 정의 (RLS 설정 필수)
export type PublicProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"], // 실제 테이블 이름 ('profiles' 등) 확인 필요
  "id" | "name" | "profile_circle_img" // 공개 가능한 컬럼 (bio는 없다고 가정)
  // 필요시 다른 공개 가능 컬럼 추가
>

// 팔로우 상태 타입 (예시)
export type FollowStatus = {
  isFollowing: boolean
  // 팔로워/팔로잉 수 등 추가 가능
  // followerCount?: number;
  // followingCount?: number;
}

// 비디오 데이터 타입 (예시 - 실제 구조에 맞게 수정 필요)
export type ProfileVideoData = {
  id: string
  title: string
  thumbnail_url: string
  view_count: number
  created_at: string
}

// Prefetch용 데이터 타입 (ProfilePageContainer)
export type PrefetchedProfileData = Pick<
  UsersRow,
  "id" | "name" | "profile_circle_img" | "is_online"
> &
  Pick<
    ProfilesRow,
    | "user_id" // isOwner 확인 등에 필요할 수 있음
    | "nickname"
    | "follower_count"
    | "description"
    | "selected_tags"
    | "youtube_urls"
    | "selected_games" // 게임 목록 생성에 필요
    // 필요에 따라 RLS 고려하여 추가
  > & { public_id: number }

// 앨범 이미지 타입 (ProfileAlbumCarousel)
export type AlbumImage = Pick<Album_imagesRow, "id" | "image_url" | "order_num"> & { alt: string }

// 게임 정보 타입 (ProfileGameList) - 기존 games 배열 구조 활용 또는 DB 연동
export type GameInfo = {
  id: number | string
  title: string
  image: string
}

// 비디오 정보 타입 (ProfileVideoSection)
export type VideoInfo = {
  id: number | string
  embedUrl: string
}

// 리뷰 정보 타입 (ProfileReviewSection) - API 응답 기준
export type ReviewInfo = Omit<ReviewsRow, "reviewer_id" | "reviewed_id" | "request_id"> & {
  reviewer: Pick<UsersRow, "id" | "name" | "profile_circle_img"> | null // 작성자 정보 포함 (nullable)
}

// ProfileHeader Props
export interface ProfileHeaderProps {
  profileId: string // public_id
}

// ProfileMainContent Props
export interface ProfileMainContentProps {
  profileId: string // public_id
}

// ProfileAlbumCarousel Props
export interface ProfileAlbumCarouselProps {
  userId: string // 실제 user_id
  profileNickname: string | null
}

// ProfileTags Props
export interface ProfileTagsProps {
  tags: readonly string[] | null
}

// ProfileGameList Props
export interface ProfileGameListProps {
  selectedGames: readonly string[] | null
  isOwner: boolean // GameCard에 전달
  rating?: number // 옵셔널로 추가 (GameCard가 옵셔널을 허용한다고 가정)
  reviewCount?: number // 옵셔널로 추가
  // 예약 모달에서 의뢰 생성 시 제공자(user) 식별에 사용
  providerUserId: string
}

// ProfileInfoSection Props
export interface ProfileInfoSectionProps {
  introduction: string | null
}

// ProfileVideoSection Props
export interface ProfileVideoSectionProps {
  youtubeUrls: readonly string[] | null
}

// ProfileReviewSection Props
export interface ProfileReviewSectionProps {
  profileId: string // public_id
}
