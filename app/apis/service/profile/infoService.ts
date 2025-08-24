'use server'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { getProfileByUserId, updateProfileByUserId } from '@/app/apis/repository/profile/profilesRepository'
import { profileSchema } from '@/libs/schemas/profile.schema'
import type { Database } from '@/types/database.types'

export async function getProfileInfo() {
  const userId = await getCurrentUserId()
  const profile = await getProfileByUserId(userId)
  if (!profile) return { profileData: null }
  const payload = {
    ...profile,
    nickname: profile.nickname ?? '',
    username: profile.username ?? '',
    description: profile.description ?? '',
    selected_games: profile.selected_games ?? [],
    selected_tags: profile.selected_tags ?? [],
    youtube_urls: profile.youtube_urls ?? [],
    is_mate: profile.is_mate ?? false,
  }
  return { profileData: payload }
}

export async function updateProfileInfo(requestData: unknown) {
  const userId = await getCurrentUserId()
  const partial = profileSchema.partial()
  const validation = partial.safeParse(requestData)
  if (!validation.success) {
    return { error: '입력값이 유효하지 않습니다.', details: validation.error.flatten().fieldErrors, status: 400 as const }
  }
  const validated = validation.data
  const patch: Partial<Database['public']['Tables']['profiles']['Update']> = {}
  if (validated.nickname !== undefined) patch.nickname = validated.nickname
  if (validated.username !== undefined) patch.username = validated.username
  if (validated.description !== undefined) patch.description = validated.description
  if (validated.selected_games !== undefined) patch.selected_games = validated.selected_games
  if (validated.selected_tags !== undefined) patch.selected_tags = validated.selected_tags
  if (validated.youtube_urls !== undefined) patch.youtube_urls = validated.youtube_urls
  if (validated.is_mate !== undefined) patch.is_mate = validated.is_mate
  if (Object.keys(patch).length === 0) return { success: true, message: 'No changes detected' }
  patch.updated_at = new Date().toISOString()
  const data = await updateProfileByUserId(userId, patch)
  return { success: true, data }
}


