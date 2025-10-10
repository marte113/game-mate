import "server-only"

import { unstable_cache } from "next/cache"

import { repoGetPublicProfile } from "@/app/apis/repository/profile/profile.repository.server"
import { repoGetUserMinimalById } from "@/app/apis/repository/user/user.repository.server"
import type { PrefetchedProfileData } from "@/app/profile/_types/profile.types"
import { wrapService } from "@/app/apis/base/errors"

/**
 * 성공한 경우만 캐싱되는 내부 구현
 * 에러나 null을 반환하지 않고 throw하여 캐싱 방지
 */
async function getPublicProfile(publicId: number): Promise<PrefetchedProfileData> {
  const { data: profileInfo, error: profileErr } = await repoGetPublicProfile(publicId)
  if (profileErr) throw profileErr
  if (!profileInfo) throw new Error("Profile not found in profiles table")

  const { data: userInfo, error: userErr } = await repoGetUserMinimalById(profileInfo.user_id)
  if (userErr) throw userErr
  if (!userInfo) throw new Error("User not found in users table")

  return {
    id: userInfo.id,
    name: userInfo.name,
    profile_circle_img: userInfo.profile_circle_img,
    is_online: userInfo.is_online,
    user_id: profileInfo.user_id,
    nickname: profileInfo.nickname,
    follower_count: profileInfo.follower_count,
    description: profileInfo.description,
    selected_tags: profileInfo.selected_tags,
    youtube_urls: profileInfo.youtube_urls,
    selected_games: profileInfo.selected_games,
    public_id: publicId,
  }
}

/**
 * 공개 프로필 조회 (캐싱 적용)
 * - 성공한 데이터만 5분간 캐싱
 * - 에러/null은 캐싱하지 않음 (다음 요청 시 재시도)
 */
export async function svcGetPublicProfile(publicId: number): Promise<PrefetchedProfileData | null> {
  return wrapService("profile.svcGetPublicProfile", async () => {
    if (!Number.isFinite(publicId)) return null

    try {
      // unstable_cache: 성공한 경우만 5분간 캐싱
      return await unstable_cache(
        () => getPublicProfile(publicId),
        [`public-profile-${publicId}`],
        {
          revalidate: 300, // 5분마다 재검증
          tags: [`profile-${publicId}`], // 태그 기반 무효화 가능
        },
      )()
    } catch (error) {
      // 에러는 캐싱되지 않고 바로 처리됨
      if (error instanceof Error && error.message.includes("not found")) {
        // 프로필이나 유저가 없는 경우 null 반환 (404 처리용)
        return null
      }
      // 그 외 에러는 상위로 전파 (DB 오류 등)
      throw error
    }
  })
}
