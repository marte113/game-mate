"use client"

import { useInfiniteQuery, UseInfiniteQueryOptions, QueryKey, QueryFunctionContext } from "@tanstack/react-query"

export type AppError = Error & { code?: string; status?: number; details?: unknown }

type AppInfiniteQueryParams<
  TQueryFnData,
  TError,
  TData,
  TKey extends QueryKey,
  TPageParam = unknown
> = {
  queryKey: TKey
  queryFn: (ctx: QueryFunctionContext<TKey, TPageParam>) => Promise<TQueryFnData>
} & Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TKey, TPageParam>, "queryKey" | "queryFn">

function defaultRetry(failureCount: number, error: unknown) {
  const err = error as AppError
  // 4xx는 재시도하지 않음, 5xx는 최대 2회 재시도
  if (err?.status && err.status >= 400 && err.status < 500) return false
  return failureCount < 2
}

export function useAppInfiniteQuery<
  TQueryFnData,
  TError = AppError,
  TData = TQueryFnData,
  TKey extends QueryKey = QueryKey,
  TPageParam = unknown
>(params: AppInfiniteQueryParams<TQueryFnData, TError, TData, TKey, TPageParam>) {
  return useInfiniteQuery({
    retry: defaultRetry,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    ...params,
  })
}
