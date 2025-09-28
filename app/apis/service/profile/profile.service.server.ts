import "server-only"
import {
  repoGetProfileUserIdByPublicId,
  repoGetPublicProfile,
} from "@/app/apis/repository/profile/profile.repository.server"
import type { PrefetchedProfileData } from "@/app/profile/_types/profile.types"
import type { AppError } from "@/libs/api/errors"

export async function svcCheckProfileExists(profileId: string): Promise<boolean> {
  const numericProfileId = Number(profileId)
  if (!Number.isFinite(numericProfileId)) return false

  const { userId } = await repoGetProfileUserIdByPublicId(numericProfileId)
  return !!userId
}

export async function svcGetPublicProfile(publicId: number): Promise<PrefetchedProfileData | null> {
  if (!Number.isFinite(publicId)) return null
  const { data, error } = await repoGetPublicProfile(publicId)

  if (error) {
    // Supabase PostgrestError 코드(PGRST116: single()에서 0 rows) 또는 메시지 기반 Not Found 판정
    const raw = error as { code?: unknown; message?: unknown }
    const code = typeof raw.code === "string" ? raw.code : undefined
    const message: string = typeof raw.message === "string" ? raw.message : String(error)
    const isNotFound = code === "PGRST116" || /not found/i.test(message)

    if (isNotFound) return null

    const appError = new Error(
      "서버에서 프로필 정보를 불러오는 중 오류가 발생했습니다.",
    ) as AppError
    appError.status = 500
    appError.details = error
    throw appError
  }

  return data ?? null
}
