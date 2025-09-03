import 'server-only'
import { repoGetProfileUserIdByPublicId } from '@/app/apis/repository/profile/profile.repository.server'
import { repoGetPublicProfile } from '@/app/apis/repository/profile/profile.repository.server'
import type { PrefetchedProfileData } from '@/app/profile/_types/profile.types'

export async function svcCheckProfileExists(profileId: string): Promise<boolean> {
  const numericProfileId = Number(profileId)
  if (!Number.isFinite(numericProfileId)) return false

  const { userId } = await repoGetProfileUserIdByPublicId(numericProfileId)
  return !!userId
}

export async function svcGetPublicProfile(publicId: number): Promise<PrefetchedProfileData | null> {
  if (!Number.isFinite(publicId)) return null
  const { data } = await repoGetPublicProfile(publicId)
  return data ?? null
}


