'use server'

import { getCompletedRequestsByGames, getGamesByIds, getMatesBySelectedGames, getRecommendedLatest } from '@/app/apis/repository/category/recommendRepository'
import { calcNextPage } from '@/app/apis/base'
import { createDailyGameRandom, pickNewbieCount } from '@/utils/recommendation'
import type { ThemeWithMates, MateData } from '@/app/(home)/_types/homePage.types'
import type { UsersRow, ProfilesRow } from '@/types/database.table.types'

const THEMES_PER_PAGE_INITIAL = 3
const THEMES_PER_PAGE = 2
const MATES_PER_THEME = 12
const NEWBIE_DAYS = 30
const NEWBIE_TARGET_MIN = 3
const NEWBIE_TARGET_MAX = 4

type UserRef = Pick<UsersRow, 'is_online' | 'profile_thumbnail_img'>
type ProfileCandidate = Pick<
  ProfilesRow,
  | 'id'
  | 'user_id'
  | 'nickname'
  | 'description'
  | 'rating'
  | 'public_id'
  | 'follower_count'
  | 'created_at'
  | 'selected_games'
  | 'is_mate'
> & { users: UserRef | null }

export async function buildRecommendedThemes(page: number) {
  const themesPerPage = page === 0 ? THEMES_PER_PAGE_INITIAL : THEMES_PER_PAGE
  const offset = page === 0 ? 0 : THEMES_PER_PAGE_INITIAL + (page - 1) * THEMES_PER_PAGE

  const { latest, total } = await getRecommendedLatest(offset, themesPerPage)
  const gameIds = latest
    .map((r) => r.game_id)
    .filter((id): id is string => typeof id === 'string')
  if (gameIds.length === 0) return { themes: [] as ThemeWithMates[], nextPage: null as number | null }

  const gamesRaw = await getGamesByIds(gameIds)
  const idToGame = new Map(gamesRaw.map((g) => [g.id, g]))
  const pageGames = gameIds.map((id) => idToGame.get(id)).filter(Boolean) as typeof gamesRaw
  if (pageGames.length === 0) return { themes: [] as ThemeWithMates[], nextPage: null as number | null }

  const gameDescs = pageGames
    .map((g) => g.description)
    .filter((d): d is string => typeof d === 'string')
  const gameNames = pageGames.map((g) => g.name)

  const descToName = new Map<string, string>()
  pageGames.forEach((g) => { if (g.description && g.name) descToName.set(g.description, g.name) })

  const candidates = (await getMatesBySelectedGames(gameDescs)) as ProfileCandidate[]

  const ninetyDaysAgoIso = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()
  const orderAgg = await getCompletedRequestsByGames(gameNames, ninetyDaysAgoIso)
  const ordersMap = new Map<string, number>()
  orderAgg.forEach((r: any) => {
    const k = `${r.provider_id ?? ''}::${r.game ?? ''}`
    ordersMap.set(k, (ordersMap.get(k) ?? 0) + 1)
  })

  const now = new Date()
  const isNewbie = (profile: ProfileCandidate): boolean => {
    const createdAt = profile.created_at ? new Date(profile.created_at) : null
    const recent = createdAt ? (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24) <= NEWBIE_DAYS : false
    const lowFollower = (profile.follower_count ?? 0) < 10
    return recent || lowFollower
  }

  const scoreFor = (profile: ProfileCandidate, desc: string): number => {
    const rating = typeof profile.rating === 'number' ? profile.rating : 0
    const followers = typeof profile.follower_count === 'number' ? profile.follower_count : 0
    const followersNorm = Math.min(Math.log10(1 + followers) / 3, 1)
    const onlineBonus = profile.users?.is_online ? 0.2 : 0
    const gameName = descToName.get(desc) ?? desc
    const ordersRecent = ordersMap.get(`${profile.user_id ?? ''}::${gameName}`) ?? 0
    const ordersNorm = Math.min(Math.log1p(ordersRecent) / 3, 1)
    return rating / 5 + followersNorm + onlineBonus + ordersNorm
  }

  const themes: ThemeWithMates[] = pageGames.map((game) => {
    const desc = game.description || ''
    const gameCandidates = candidates.filter(
      (p) => Array.isArray(p.selected_games) && (p.selected_games as string[]).includes(desc)
    )

    const rng = createDailyGameRandom(game.id)

    const newbies = gameCandidates.filter(isNewbie)
    const veterans = gameCandidates.filter((p) => !isNewbie(p))

    const jitter = 0.5
    const sortByWeightedRandom = (arr: ProfileCandidate[]) =>
      arr
        .map((p) => ({ p, w: scoreFor(p, desc) + rng() * jitter }))
        .sort((a, b) => b.w - a.w)
        .map((x) => x.p)

    const newbiesSorted = sortByWeightedRandom(newbies)
    const veteransSorted = sortByWeightedRandom(veterans)

    const newbieCount = Math.min(pickNewbieCount(rng, NEWBIE_TARGET_MIN, NEWBIE_TARGET_MAX), MATES_PER_THEME)
    const pickedNewbies = newbiesSorted.slice(0, newbieCount)
    const remaining = MATES_PER_THEME - pickedNewbies.length
    const pickedVeterans = veteransSorted.slice(0, remaining)

    let picked = [...pickedNewbies, ...pickedVeterans]
    if (picked.length < MATES_PER_THEME) {
      const extraNeed = MATES_PER_THEME - picked.length
      const extraNewbies = newbiesSorted.slice(pickedNewbies.length, pickedNewbies.length + extraNeed)
      picked = [...picked, ...extraNewbies]
    }
    picked = picked.slice(0, MATES_PER_THEME)

    const mates: MateData[] = picked.map((profile) => ({
      id: profile.user_id || '',
      public_id: profile.public_id,
      name: profile.nickname || 'Unknown',
      game: desc,
      gameIcon: game.image_url || '/default-game-icon.png',
      price: 800,
      rating: profile.rating || 0,
      description: profile.description || '',
      image: profile.users?.profile_thumbnail_img || '/default-avatar.png',
      isOnline: profile.users?.is_online || false,
      videoLength: '00:00',
    }))

    return {
      id: game.id,
      name: game.name,
      description: desc,
      image_url: game.image_url || '',
      mates,
    }
  })

  const hasMore = total != null ? offset + themesPerPage < total : themes.length > 0 && themes.length === themesPerPage
  const nextPage = await calcNextPage(hasMore, page)
  return { themes, nextPage: nextPage ?? null }
}


