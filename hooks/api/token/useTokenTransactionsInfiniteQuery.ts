"use client"

import { useInfiniteQuery, UseInfiniteQueryOptions, InfiniteData } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import type { Database } from "@/types/database.types"
import { fetchJson } from "@/libs/api/fetchJson"

export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']
export type TokenTransactionsResponse = { 
  items: TokenTransaction[]
  nextCursor?: string
  hasMore: boolean
}

export function useTokenTransactionsInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    TokenTransactionsResponse,
    Error,  
    InfiniteData<TokenTransactionsResponse>,
    TokenTransactionsResponse,
    ReturnType<typeof queryKeys.token.transactions>,
    string | undefined
  > & { pageSize?: number }
) {
  const pageSize = options?.pageSize ?? 10
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pageSize: _omit, ...opts } = options ?? {}

  return useInfiniteQuery({
    queryKey: queryKeys.token.transactions(),
    queryFn: async ({ pageParam }) => {
      const url = new URL('/api/token/transactions', window.location.origin)
      if (pageParam) url.searchParams.append('pageParam', String(pageParam))
      url.searchParams.append('limit', String(pageSize))
      return fetchJson<TokenTransactionsResponse>(url.toString(), { credentials: 'include' })
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    staleTime: 60_000,
    ...opts,
  })
}
