"use client"

import {
  useQuery,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseInfiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import {
  fetchGameHeader,
  fetchPopularGames,
  type PopularGamesResponse,
  fetchGames,
} from "@/app/category/_api/CategoryApi"
import { fetchMates } from "@/app/category/_api/mateApi"
import { type GameHeader, type MateCardData } from "@/app/category/_types/categoryPage.types"
import type { GamesRow } from "@/types/database.table.types"

export type MatesApiResponse = {
  mates: MateCardData[]
  nextPage?: number
}

export type GamesApiResponse = {
  games: GamesRow[]
  nextPage?: number
}

export function useGameHeaderQuery(
  categoryId: string | undefined,
  options?: UseQueryOptions<
    GameHeader,
    Error,
    GameHeader,
    ReturnType<typeof queryKeys.category.gameHeader>
  >,
) {
  return useQuery({
    queryKey: queryKeys.category.gameHeader(categoryId),
    queryFn: () => fetchGameHeader(categoryId!),
    enabled: !!categoryId,
    staleTime: 300_000, // 5분 (카테고리 헤더는 자주 변하지 않음)
    throwOnError: true,
    ...options,
  })
}

export function usePopularGamesQuery(
  limit: number = 6,
  options?: UseQueryOptions<
    PopularGamesResponse,
    Error,
    PopularGamesResponse,
    ReturnType<typeof queryKeys.category.popularGames>
  >,
) {
  return useQuery({
    queryKey: queryKeys.category.popularGames(),
    queryFn: () => fetchPopularGames(limit),
    staleTime: 600_000, // 10분 (인기 게임은 덜 자주 갱신)
    throwOnError: true,
    ...options,
  })
}

export function useGamesInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    GamesApiResponse,
    Error,
    InfiniteData<GamesApiResponse>,
    GamesApiResponse,
    ReturnType<typeof queryKeys.category.games>,
    number
  >,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.category.games(),
    queryFn: (context) => fetchGames(context),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 300_000, // 5분
    throwOnError: true,
    ...options,
  })
}

export function useMatesByCategoryInfiniteQuery(
  categoryId: string | undefined,
  options?: UseInfiniteQueryOptions<
    MatesApiResponse,
    Error,
    InfiniteData<MatesApiResponse>,
    MatesApiResponse,
    ReturnType<typeof queryKeys.category.mates>,
    number
  >,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.category.mates(categoryId),
    queryFn: (context) => {
      if (!categoryId) throw new Error("Category ID is required")
      // fetchMates가 기대하는 queryKey 타입에 맞춰 조정
      const matesContext = {
        ...context,
        queryKey: ["mates", categoryId] as const,
        pageParam: Number(context.pageParam ?? 0),
      }
      return fetchMates(matesContext)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!categoryId,
    staleTime: 300_000, // 5분
    throwOnError: true,
    ...options,
  })
}
