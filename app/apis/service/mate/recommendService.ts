'use server'
import { listPartnerMates, listSimpleRecommendedMates } from '@/app/apis/repository/mate/mateRepository'
import type { UsersRow, ProfilesRow } from '@/types/database.table.types'

export type RecommendedMateData = {
  public_id: number
  nickname: string | null
  profileImageUrl: string | null
  firstGame: string | null
  isOnline: boolean | null
}

type ProfileWithUserLite = Pick<ProfilesRow, 'public_id' | 'nickname' | 'selected_games'> & {
  users: Pick<UsersRow, 'profile_circle_img' | 'is_online'> | null
}

function toRecommended(data: ProfileWithUserLite[]): RecommendedMateData[] {
  return data
    .filter((profile) => profile.users !== null)
    .map((profile) => {
      const userData = profile.users
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


