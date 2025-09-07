"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"

export interface GamesByTitlesResponse {
  games: Array<{ id: number; name: string; description: string | null; image_url: string | null }>
}

function buildTitlesKey(titles: readonly string[]): string {
  return [...titles]
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(",")
}

export function useGamesByTitles(
  titles: readonly string[],
  options?: UseQueryOptions<
    GamesByTitlesResponse,
    Error,
    GamesByTitlesResponse,
    ReturnType<typeof queryKeys.category.gameImagesByTitles>
  >,
) {
  const titlesKey = buildTitlesKey(titles)
  return useQuery({
    queryKey: queryKeys.category.gameImagesByTitles(titlesKey),
    queryFn: async () => {
      const qs = new URLSearchParams({ titles: titles.join(",") })
      const res = await fetch(`/api/games/by-titles?${qs.toString()}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "게임 이미지를 가져오는데 실패했습니다")
      }
      return (await res.json()) as GamesByTitlesResponse
    },
    enabled: titles.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  })
}
