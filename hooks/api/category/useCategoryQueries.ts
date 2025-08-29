"use client"

import { UseQueryOptions, UseInfiniteQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchGameHeader, fetchPopularGames, PopularGamesResponse, fetchGames } from "@/app/category/_api/CategoryApi"
import { fetchMates } from "@/app/category/_api/mateApi"
import { GameHeader, MateCardData } from "@/app/category/_types/categoryPage.types"
import { useAppQuery } from "@/hooks/api/core/useAppQuery"
import { useAppInfiniteQuery } from "@/hooks/api/core/useAppInfiniteQuery"
import { AppPage, createAppPage } from "@/libs/api/pagination"
import type { GamesRow } from "@/types/database.table.types"

export function useGameHeaderQuery(
  categoryId: string | undefined,
  options?: UseQueryOptions<GameHeader, Error, GameHeader, ReturnType<typeof queryKeys.category.gameHeader>>
) {
  return useAppQuery({
    queryKey: queryKeys.category.gameHeader(categoryId),
    queryFn: () => fetchGameHeader(categoryId!),
    enabled: !!categoryId,
    staleTime: 300_000, // 5분 (카테고리 헤더는 자주 변하지 않음)
    ...options,
  })
}

export function usePopularGamesQuery(
  limit: number = 6,
  options?: UseQueryOptions<PopularGamesResponse, Error, PopularGamesResponse, ReturnType<typeof queryKeys.category.popularGames>>
) {
  return useAppQuery({
    queryKey: queryKeys.category.popularGames(),
    queryFn: () => fetchPopularGames(limit),
    staleTime: 600_000, // 10분 (인기 게임은 덜 자주 갱신)
    ...options,
  })
}

export function useGamesInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    AppPage<GamesRow>,
    Error,
    AppPage<GamesRow>,
    ReturnType<typeof queryKeys.category.games>,
    number
  >
) {
  return useAppInfiniteQuery({
    queryKey: queryKeys.category.games(),
    queryFn: (context) => fetchGames(context).then((res) => createAppPage(res.games, res.nextPage)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      typeof lastPage.nextCursor === 'number' ? lastPage.nextCursor : undefined,
    // staleTime 기본값은 useAppInfiniteQuery(60s)에서 관리
    ...options,
  })
}

export function useMatesByCategoryInfiniteQuery(
  categoryId: string | undefined,
  options?: UseInfiniteQueryOptions<
    AppPage<MateCardData>,
    Error,
    AppPage<MateCardData>,
    ReturnType<typeof queryKeys.category.mates>,
    number
  >
) {
  return useAppInfiniteQuery({
    queryKey: queryKeys.category.mates(categoryId),
    queryFn: (context) => {
      if (!categoryId) throw new Error('Category ID is required')
      // fetchMates가 기대하는 queryKey 타입에 맞춰 조정
      const matesContext = {
        ...context,
        queryKey: ['mates', categoryId] as const,
        pageParam: Number(context.pageParam ?? 0),
      }
      return fetchMates(matesContext).then((res) => createAppPage(res.mates, res.nextPage))
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      typeof lastPage.nextCursor === 'number' ? lastPage.nextCursor : undefined,
    enabled: !!categoryId,
    // staleTime 기본값은 useAppInfiniteQuery(60s)에서 관리
    ...options,
  })
}
