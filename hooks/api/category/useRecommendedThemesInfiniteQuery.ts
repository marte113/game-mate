"use client"

import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchRecommendedThemes } from "@/app/(home)/_api/homeApi"
import { type RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types"

export function useRecommendedThemesInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    RecommendedThemeResponse,
    Error,
    InfiniteData<RecommendedThemeResponse>,
    RecommendedThemeResponse,
    ReturnType<typeof queryKeys.category.recommendedThemes>,
    number
  >,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.category.recommendedThemes(),
    queryFn: ({ pageParam }) => fetchRecommendedThemes({ pageParam: Number(pageParam ?? 0) }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 300_000, // 5분
    throwOnError: true,
    ...options,
  })
}
