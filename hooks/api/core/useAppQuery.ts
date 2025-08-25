"use client"

import { useQuery, UseQueryOptions, QueryKey, QueryFunctionContext } from "@tanstack/react-query"

type AppQueryParams<TQueryFnData, TError, TData, TKey extends QueryKey> = {
  queryKey: TKey
  queryFn: (ctx: QueryFunctionContext<TKey>) => Promise<TQueryFnData>
} & Omit<UseQueryOptions<TQueryFnData, TError, TData, TKey>, "queryKey" | "queryFn">

export function useAppQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TKey extends QueryKey = QueryKey
>(params: AppQueryParams<TQueryFnData, TError, TData, TKey>) {
  return useQuery(params)
}


