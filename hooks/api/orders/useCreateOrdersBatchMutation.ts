"use client"

import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import {
  orderApi,
  type CreateOrderRequest,
  type OrderResponse,
} from "@/app/dashboard/_api/orderApi"

export function useCreateOrdersBatchMutation(
  options?: UseMutationOptions<OrderResponse[], Error, CreateOrderRequest[]>,
) {
  const queryClient = useQueryClient()

  return useMutation<OrderResponse[], Error, CreateOrderRequest[]>({
    mutationFn: async (requests) => {
      const results = await Promise.all(requests.map((req) => orderApi.createOrder(req)))
      return results
    },
    onSuccess: (data, variables) => {
      // 성공 시 관련 쿼리들을 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.requested() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.received() })

      // providerReservations 무효화 (첫 요소의 providerId 사용)
      const providerId = variables[0]?.providerId
      if (providerId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.providerReservations(providerId),
        })
      }

      // 옵션 onSuccess도 호출
      options?.onSuccess?.(data, variables, undefined)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
    onMutate: (variables) => {
      return options?.onMutate?.(variables)
    },
    onSettled: (data, error, variables, context) => {
      options?.onSettled?.(data, error, variables, context)
    },
  })
}
