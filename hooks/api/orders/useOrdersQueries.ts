"use client"

import { UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { orderApi, OrdersResponse } from "@/app/dashboard/_api/orderApi"
import { useAppQuery } from "@/hooks/api/core/useAppQuery"

export function useRequestedOrdersQuery(
  options?: UseQueryOptions<OrdersResponse, Error, OrdersResponse, ReturnType<typeof queryKeys.orders.requested>>
) {
  return useAppQuery({
    queryKey: queryKeys.orders.requested(),
    queryFn: orderApi.getRequestedOrders,
    staleTime: 30_000, // 30초
    ...options,
  })
}

export function useReceivedOrdersQuery(
  options?: UseQueryOptions<OrdersResponse, Error, OrdersResponse, ReturnType<typeof queryKeys.orders.received>>
) {
  return useAppQuery({
    queryKey: queryKeys.orders.received(),
    queryFn: orderApi.getReceivedOrders,
    staleTime: 30_000, // 30초
    ...options,
  })
}

export function useProviderReservationsQuery(
  providerId: string | undefined,
  options?: UseQueryOptions<OrdersResponse, Error, OrdersResponse, ReturnType<typeof queryKeys.orders.providerReservations>>
) {
  return useAppQuery({
    queryKey: queryKeys.orders.providerReservations(providerId ?? ''),
    queryFn: () => orderApi.getProviderReservations(providerId!),
    enabled: !!providerId,
    staleTime: 30_000, // 30초
    ...options,
  })
}
