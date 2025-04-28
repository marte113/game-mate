// 카테고리 페이지에서 사용되는 타입 정의
// category폴더 내부에서 사용되는 전반의 타입은 여기서 다룸.

import type {
  ProfilesRow,
  UsersRow,
  GamesRow
} from '@/types/database.table.types' // 기본 테이블 타입 경로

// API 라우트에서 사용할 조인된 데이터의 상세 타입 (선택적이지만 가독성 향상)
// Supabase 쿼리 결과의 users와 games가 단일 객체 또는 null일 것으로 예상하고 정의
export type ProfileWithUserAndGameIcon = Omit<ProfilesRow, 'user_id'> & { // user_id는 id로 매핑 예정
  user_id: string // 명시적으로 string으로 정의
  users: Pick<UsersRow, 'is_online' | 'profile_thumbnail_img'> | null
  // gameIcon 조회를 위해 games 테이블과의 관계가 필요하지만,
  // 직접 조인 대신 별도 쿼리로 gameIcon을 가져올 것이므로 여기서는 제외하거나 선택적으로 포함 가능
  // 만약 API 응답 데이터 구조에 gameIcon 필드가 직접 포함된다면 추가
}

// MateCard 컴포넌트 프롭 타입
export interface MateCardData {
  id: string // profiles.user_id
  name: string
  game: string // categoryId (영문 이름)
  gameIcon: string
  price: number
  rating: number
  description: string
  image: string // users.profile_thumbnail_img
  isOnline: boolean
  videoLength: string // 목 데이터
}

// API 응답 타입
export interface MatesApiResponse {
  mates: MateCardData[]
  nextPage: number | undefined
}

export interface GameHeader {
  image_url: string;
  description: string;
  genre: string[];
}

