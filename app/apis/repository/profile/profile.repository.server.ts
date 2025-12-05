import "server-only"

import { createServerClientComponent, createPublicClient } from "@/supabase/functions/server"
import type { ProfilesRow } from "@/types/database.table.types"

// 프로필 공개 조회에 사용하는 컬럼 서브셋 타입
type ProfilePublicProjection = Pick<
  ProfilesRow,
  | "user_id"
  | "nickname"
  | "follower_count"
  | "description"
  | "selected_tags"
  | "youtube_urls"
  | "selected_games"
>

// 인증된 사용자 프로필 조회용 (authStore에서 사용)
export type AuthProfileProjection = Pick<ProfilesRow, "id" | "nickname" | "rating">

// Fetch full public profile by publicId by joining profiles and users
// Returns merged shape compatible with PrefetchedProfileData
export async function repoGetPublicProfile(
  publicId: number,
): Promise<{ data: ProfilePublicProjection | null; error: Error | null }> {
  const supabase = createPublicClient() // ✅ 공개 클라이언트 사용 (cookies 불필요)

  const { data: profileInfo, error: profileError } = await supabase
    .from("profiles")
    .select(
      "user_id, nickname, follower_count, description, selected_tags, youtube_urls, selected_games",
    )
    .eq("public_id", publicId)
    .maybeSingle()

  // 프로필 조회 실패는 상향, 0행(없음) 또는 user_id 없음은 정상화(null)
  if (profileError) {
    return { data: null, error: profileError as Error }
  }
  if (!profileInfo || !profileInfo.user_id) {
    return { data: null, error: null }
  }
  // users 조회는 사용자 레포지토리로 분리하고, 서비스 레이어에서 조합합니다
  return { data: profileInfo as ProfilePublicProjection, error: null }
}

/**
 * 인증된 사용자의 profiles 테이블 정보 조회
 * - 쿠키 기반 인증 필요 (Server Action/API Route에서 호출)
 * - authStore 동기화용
 */
export async function repoGetAuthProfileByUserId(
  userId: string,
): Promise<{ data: AuthProfileProjection | null; error: Error | null }> {
  if (!userId || userId.trim() === "") {
    return { data: null, error: null }
  }

  const supabase = await createServerClientComponent()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, rating")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) return { data: null, error: error as Error }
  return { data: (data as AuthProfileProjection) ?? null, error: null }
}
