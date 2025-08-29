"use client"

import { UseInfiniteQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import type { Database } from "@/types/database.types"
import { fetchJson } from "@/libs/api/fetchJson"
import { useAppInfiniteQuery } from "@/hooks/api/core/useAppInfiniteQuery"
import { AppPage } from "@/libs/api/pagination"

export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']
export type TokenTransactionsPage = AppPage<TokenTransaction>

export function useTokenTransactionsInfiniteQuery(
  options?: UseInfiniteQueryOptions<
    TokenTransactionsPage,
    Error,
    TokenTransactionsPage,
    ReturnType<typeof queryKeys.token.transactions>,
    string | undefined
  > & { pageSize?: number }
) {
  const pageSize = options?.pageSize ?? 10
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pageSize: _omit, ...opts } = options ?? {}

  return useAppInfiniteQuery({
    queryKey: queryKeys.token.transactions(),
    queryFn: async ({ pageParam }) => {
      const url = new URL('/api/token/transactions', window.location.origin)
      if (pageParam) url.searchParams.append('pageParam', String(pageParam))
      url.searchParams.append('limit', String(pageSize))
      return fetchJson<TokenTransactionsPage>(url.toString(), { credentials: 'include' })
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => typeof lastPage?.nextCursor === 'string' ? lastPage.nextCursor : undefined,
    ...opts,
  })
}
