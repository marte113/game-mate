"use client"

import { useInfiniteQuery, UseInfiniteQueryOptions, QueryKey, QueryFunctionContext } from "@tanstack/react-query"
import type { AppError } from "@/libs/api/errors"
import { defaultRetry } from "@/libs/api/errors"

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
