"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchTokenBalance, fetchTokenUsage, TokenUsageData } from "@/app/dashboard/_api/tokenApi"

type BalanceValue = number

export function useTokenBalanceQuery(
  userId?: string | null,
  options?: UseQueryOptions<
    BalanceValue,
    Error,
    BalanceValue,
    ReturnType<typeof queryKeys.token.balanceHeader>
  >,
) {
  return useQuery({
    queryKey: queryKeys.token.balanceHeader(userId ?? ""),
    queryFn: async () => {
      if (!userId) return 0
      return fetchTokenBalance()
    },
    enabled: !!userId,
    staleTime: 60_000, // 1분
    throwOnError: true,
    ...options,
  })
}

export function useTokenUsageQuery(
  options?: UseQueryOptions<
    TokenUsageData,
    Error,
    TokenUsageData,
    ReturnType<typeof queryKeys.token.usage>
  >,
) {
  return useQuery({
    queryKey: queryKeys.token.usage(),
    queryFn: fetchTokenUsage,
    staleTime: 300_000, // 5분 (사용량은 자주 변하지 않음)
    throwOnError: true,
    ...options,
  })
}
