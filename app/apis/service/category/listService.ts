'use server'
import { listGames } from '@/app/apis/repository/category/gamesRepository'

import { calcLimitOffset, calcNextPage } from '../../base/pagination';

const INITIAL_LOAD = 18
const LOAD_PER_PAGE = 12

export async function getCategoryList(page: number) {
  // const limit = page === 0 ? INITIAL_LOAD : LOAD_PER_PAGE
  // const offset = page === 0 ? 0 : INITIAL_LOAD + (page - 1) * LOAD_PER_PAGE

  const {limit, offset} = calcLimitOffset({page, initialLoad : INITIAL_LOAD, perPage : LOAD_PER_PAGE});

  const games = await listGames(offset, limit)
  const hasMore = (games?.length ?? 0) === limit
  const nextPage = calcNextPage(hasMore, page)
  return { games: games ?? [], nextPage }
}
