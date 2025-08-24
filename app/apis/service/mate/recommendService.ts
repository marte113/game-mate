'use server'
import { listPartnerMates, listSimpleRecommendedMates } from '@/app/apis/repository/mate/mateRepository'
import type { Database } from '@/types/database.types'

export type RecommendedMateData = {
  public_id: number
  nickname: string | null
  profileImageUrl: string | null
  firstGame: string | null
  isOnline: boolean | null
}

function toRecommended(data: any[]): RecommendedMateData[] {
  return data
    .filter((profile) => profile.users !== null && !Array.isArray(profile.users))
    .map((profile) => {
      const userData = profile.users as Database['public']['Tables']['users']['Row'] | null
      return {
        public_id: profile.public_id!,
        nickname: profile.nickname,
        profileImageUrl: userData?.profile_circle_img ?? null,
        firstGame: profile.selected_games ? profile.selected_games[0] : null,
        isOnline: userData?.is_online ?? null,
      }
    })
}

export async function getSimpleRecommendedMates(limit = 5) {
  const rows = await listSimpleRecommendedMates(limit)
  return toRecommended(rows)
}

export async function getPartnerMates(limit = 5) {
  const rows = await listPartnerMates(limit)
  return toRecommended(rows)
}


