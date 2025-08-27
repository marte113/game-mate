import { repoGetProfileUserIdByPublicId } from '@/app/apis/repository/profile/profile.repository.server'

export async function svcCheckProfileExists(profileId: string): Promise<boolean> {
  const numericProfileId = Number(profileId)
  if (!Number.isFinite(numericProfileId)) return false

  const { userId } = await repoGetProfileUserIdByPublicId(numericProfileId)
  return !!userId
}


