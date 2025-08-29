"use client"

import { useQuery, UseQueryOptions, QueryKey, QueryFunctionContext } from "@tanstack/react-query"
import type { AppError } from "@/libs/api/errors"
import { defaultRetry } from "@/libs/api/errors"

type AppQueryParams<TQueryFnData, TError, TData, TKey extends QueryKey> = {
  queryKey: TKey
  queryFn: (ctx: QueryFunctionContext<TKey>) => Promise<TQueryFnData>
} & Omit<UseQueryOptions<TQueryFnData, TError, TData, TKey>, "queryKey" | "queryFn">

export function useAppQuery<
  TQueryFnData,
  TError = AppError,
  TData = TQueryFnData,
  TKey extends QueryKey = QueryKey
>(params: AppQueryParams<TQueryFnData, TError, TData, TKey>) {
  return useQuery({
    retry: defaultRetry,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    ...params,
  })
}


