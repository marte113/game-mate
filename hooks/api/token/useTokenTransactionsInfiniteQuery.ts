"use client"

import { useInfiniteQuery, UseInfiniteQueryOptions, InfiniteData } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import type { Database } from "@/types/database.types"
import { fetchJson } from "@/libs/api/fetchJson"

export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']
export type TokenTransactions = TokenTransaction[]

export function useTokenTransactionsInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    TokenTransactions,
    Error,
    InfiniteData<TokenTransactions>,
    TokenTransactions,
    ReturnType<typeof queryKeys.token.transactions>
  >
) {
  return useInfiniteQuery({
    queryKey: queryKeys.token.transactions(),
    queryFn: async ({ pageParam }) => {
      const url = new URL('/api/token/transactions', window.location.origin)
      if (pageParam) url.searchParams.append('pageParam', String(pageParam))
      return fetchJson<TokenTransactions>(url.toString(), { credentials: 'include' })
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 10) return undefined
      return lastPage[lastPage.length - 1].created_at
    },
    staleTime: 60_000,
    ...options,
  })
}
