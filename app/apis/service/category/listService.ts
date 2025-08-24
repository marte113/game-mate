'use server'
import { listGames } from '@/app/apis/repository/category/gamesRepository'

const INITIAL_LOAD = 18
const LOAD_PER_PAGE = 12

export async function getCategoryList(page: number) {
  const limit = page === 0 ? INITIAL_LOAD : LOAD_PER_PAGE
  const offset = page === 0 ? 0 : INITIAL_LOAD + (page - 1) * LOAD_PER_PAGE
  const games = await listGames(offset, limit)
  const hasNextPage = (games?.length ?? 0) === limit
  return { games: games ?? [], nextPage: hasNextPage ? page + 1 : undefined }
}


