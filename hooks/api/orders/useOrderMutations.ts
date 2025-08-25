"use client"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"

import { queryClient } from "@/libs/queryClient"

import { queryKeys } from "@/constants/queryKeys"
import { orderApi, CreateOrderRequest, ChangeOrderStatusRequest, OrderResponse } from "@/app/dashboard/_api/orderApi"

export function useCreateOrderMutation(
  options?: UseMutationOptions<OrderResponse, Error, CreateOrderRequest>
) {
  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (data, variables) => {
      // 성공 시 관련 쿼리들을 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.requested() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.received() })
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}

export function useChangeOrderStatusMutation(
  options?: UseMutationOptions<OrderResponse, Error, ChangeOrderStatusRequest>
) {
  return useMutation({
    mutationFn: orderApi.changeOrderStatus,
    onSuccess: (data, variables) => {
      // 성공 시 관련 쿼리들을 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.requested() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.received() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.providerReservations(variables.requestId) })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}
