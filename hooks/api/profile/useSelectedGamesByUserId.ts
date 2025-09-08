"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchJson } from "@/libs/api/fetchJson"

export interface SelectedGamesResponse {
  selectedGames: string[]
}

export function useSelectedGamesByUserId(
  userId: string | undefined,
  options?: UseQueryOptions<
    SelectedGamesResponse,
    Error,
    SelectedGamesResponse,
    ReturnType<typeof queryKeys.profile.selectedGamesByUserId>
  >,
) {
  return useQuery({
    queryKey: userId
      ? queryKeys.profile.selectedGamesByUserId(userId)
      : (["profile", "selectedGames", "unknown"] as const),
    queryFn: async () =>
      fetchJson<SelectedGamesResponse>(
        `/api/profile/selected-games?userId=${encodeURIComponent(userId!)}`,
      ),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  })
}
