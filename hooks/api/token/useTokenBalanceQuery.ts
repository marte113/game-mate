"use client"

import { UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchTokenBalance, fetchTokenUsage, TokenUsageData } from "@/app/dashboard/_api/tokenApi"
import { useAppQuery } from "@/hooks/api/core/useAppQuery"

type BalanceValue = number

export function useTokenBalanceQuery(
  userId?: string | null,
  options?: UseQueryOptions<BalanceValue, Error, BalanceValue, ReturnType<typeof queryKeys.token.balanceHeader>>
) {
  return useAppQuery({
    queryKey: queryKeys.token.balanceHeader(userId ?? ''),
    queryFn: async () => {
      if (!userId) return 0
      return fetchTokenBalance()
    },
    enabled: !!userId,
    staleTime: 60_000, // 1분
    ...options,
  })
}

export function useTokenUsageQuery(
  options?: UseQueryOptions<TokenUsageData, Error, TokenUsageData, ReturnType<typeof queryKeys.token.usage>>
) {
  return useAppQuery({
    queryKey: queryKeys.token.usage(),
    queryFn: fetchTokenUsage,
    staleTime: 300_000, // 5분 (사용량은 자주 변하지 않음)
    ...options,
  })
}


