"use client"

import { UseInfiniteQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchRecommendedThemes } from "@/app/(home)/_api/homeApi"
import { RecommendedThemeResponse, ThemeWithMates } from "@/app/(home)/_types/homePage.types"
import { useAppInfiniteQuery } from "@/hooks/api/core/useAppInfiniteQuery"
import { AppPage, createAppPage } from "@/libs/api/pagination"

export function useRecommendedThemesInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    AppPage<ThemeWithMates>,
    Error,
    AppPage<ThemeWithMates>,
    ReturnType<typeof queryKeys.category.recommendedThemes>,
    number
  >
) {
  return useAppInfiniteQuery({
    queryKey: queryKeys.category.recommendedThemes(),
    queryFn: ({ pageParam }) =>
      fetchRecommendedThemes({ pageParam: Number(pageParam ?? 0) })
        .then((res: RecommendedThemeResponse) => createAppPage(res.themes, res.nextPage ?? undefined)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      typeof lastPage.nextCursor === 'number' ? lastPage.nextCursor : undefined,
    ...options,
  })
}
