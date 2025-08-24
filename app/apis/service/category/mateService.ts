'use server'
import { getGameByEnglishName, listMatesByKoreanGame } from '@/app/apis/repository/category/mateRepository'
import type { MateCardData } from '@/app/category/_types/categoryPage.types'

const PAGE_SIZE_INITIAL = 20
const PAGE_SIZE_DEFAULT = 10

export async function getCategoryMates(categoryId: string, page: number) {
  const game = await getGameByEnglishName(categoryId)
  if (!game?.description) {
    return { mates: [] as MateCardData[], nextPage: undefined }
  }
  const koreanGameName = game.description
  const gameIconUrl = game.image_url || '/default-game-icon.png'

  const limit = page === 0 ? PAGE_SIZE_INITIAL : PAGE_SIZE_DEFAULT
  const offset = page === 0 ? 0 : PAGE_SIZE_INITIAL + (page - 1) * PAGE_SIZE_DEFAULT

  const { mates, total } = await listMatesByKoreanGame(koreanGameName, offset, limit)
  const formatted: MateCardData[] = (mates ?? [])
    .filter((m: any) => m.user_id !== null)
    .map((m: any) => ({
      id: m.user_id,
      public_id: m.public_id,
      name: m.nickname ?? 'Unknown',
      game: koreanGameName,
      gameIcon: gameIconUrl,
      price: 800,
      rating: m.rating ?? 0,
      description: m.description ?? '',
      image: m.users?.profile_thumbnail_img ?? '/default-avatar.png',
      isOnline: m.users?.is_online ?? false,
      videoLength: '00:00',
    }))

  const nextPage = offset + limit < total ? page + 1 : undefined
  return { mates: formatted, nextPage }
}


