"use server"
import { getCurrentUserId } from "@/app/apis/base/auth"
import {
  getProfileByUserId,
  updateProfileByUserId,
} from "@/app/apis/repository/profile/profilesRepository"
import { profilePartialSchema } from "@/libs/schemas/profile.schema"
import type { Database } from "@/types/database.types"

export async function getProfileInfo() {
  const userId = await getCurrentUserId()
  const profile = await getProfileByUserId(userId)
  if (!profile) return { profileData: null }
  const payload = {
    ...profile,
    nickname: profile.nickname ?? "",
    username: profile.username ?? "",
    description: profile.description ?? "",
    selected_games: profile.selected_games ?? [],
    selected_tags: profile.selected_tags ?? [],
    youtube_urls: profile.youtube_urls ?? [],
    is_mate: profile.is_mate ?? false,
  }
  return { profileData: payload }
}

export async function updateProfileInfo(requestData: unknown) {
  const userId = await getCurrentUserId()
  const validation = profilePartialSchema.safeParse(requestData)
  if (!validation.success) {
    return {
      error: "입력값이 유효하지 않습니다.",
      details: validation.error.flatten().fieldErrors,
      status: 400 as const,
    }
  }
  const validated = validation.data

  // 서버 교차 필드 검증을 위해 현재 DB 상태와 병합 후 유효성 확인
  const current = await getProfileByUserId(userId)
  const effectiveIsMate = validated.is_mate ?? current?.is_mate ?? false
  const effectiveSelectedGames = validated.selected_games ?? current?.selected_games ?? []
  if (
    effectiveIsMate &&
    (!Array.isArray(effectiveSelectedGames) || effectiveSelectedGames.length < 1)
  ) {
    return {
      error: "메이트로 등록하려면 최소 1개 이상의 게임을 선택해야 합니다.",
      details: { selected_games: ["메이트로 등록하려면 최소 1개 이상의 게임을 선택해야 합니다."] },
      status: 400 as const,
    }
  }
  const patch: Partial<Database["public"]["Tables"]["profiles"]["Update"]> = {}
  if (validated.nickname !== undefined) patch.nickname = validated.nickname
  if (validated.username !== undefined) patch.username = validated.username
  if (validated.description !== undefined) patch.description = validated.description
  if (validated.selected_games !== undefined) patch.selected_games = validated.selected_games
  if (validated.selected_tags !== undefined) patch.selected_tags = validated.selected_tags
  if (validated.youtube_urls !== undefined) patch.youtube_urls = validated.youtube_urls
  if (validated.is_mate !== undefined) patch.is_mate = validated.is_mate
  if (Object.keys(patch).length === 0) return { success: true, message: "No changes detected" }
  patch.updated_at = new Date().toISOString()

  // DB 업데이트
  const data = await updateProfileByUserId(userId, patch)

  // 🎯 공개 프로필 캐시 무효화 (다른 사용자들에게 즉시 반영)
  // publicId는 profiles 테이블의 public_id 컬럼
  if (current?.public_id) {
    const { revalidateTag } = await import("next/cache")
    revalidateTag(`profile-${current.public_id}`)
  }

  return { success: true, data }
}
