"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchJson } from "@/libs/api/fetchJson"
import type { GamesRow } from "@/types/database.table.types"

export interface AllGamesResponse {
  games: GamesRow[]
}

export function useAllGames(
  options?: UseQueryOptions<
    AllGamesResponse,
    Error,
    AllGamesResponse,
    ReturnType<typeof queryKeys.games.all>
  >,
) {
  return useQuery({
    queryKey: queryKeys.games.all(),
    queryFn: async () => fetchJson<AllGamesResponse>("/api/games/all"),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  })
}
