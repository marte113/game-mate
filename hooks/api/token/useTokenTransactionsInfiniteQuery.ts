"use client"

import { useInfiniteQuery, UseInfiniteQueryOptions, InfiniteData } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import type { Database } from "@/types/database.types"

export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']
export type TokenTransactionsResponse = { success: boolean; data: TokenTransaction[] }

export function useTokenTransactionsInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    TokenTransactionsResponse,
    Error,
    InfiniteData<TokenTransactionsResponse>,
    TokenTransactionsResponse,
    ReturnType<typeof queryKeys.token.transactions>
  >
) {
  return useInfiniteQuery({
    queryKey: queryKeys.token.transactions(),
    queryFn: async ({ pageParam }) => {
      const url = new URL('/api/token/transactions', window.location.origin)
      if (pageParam) url.searchParams.append('pageParam', String(pageParam))
      const res = await fetch(url.toString(), { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch token transactions')
      return res.json() as Promise<TokenTransactionsResponse>
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data || lastPage.data.length < 10) return undefined
      return lastPage.data[lastPage.data.length - 1].created_at
    },
    staleTime: 60_000,
    ...options,
  })
}
