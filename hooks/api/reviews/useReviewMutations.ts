"use client"

import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { reviewApi, CreateReviewRequest, ReviewResponse } from "@/app/dashboard/_api/reviewApi"

export function useCreateReviewMutation(
  options?: UseMutationOptions<ReviewResponse, Error, CreateReviewRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: (data, variables) => {
      // 성공 시 관련 쿼리들을 무효화하여 최신 데이터로 갱신
      // TODO: 리뷰 관련 쿼리 키가 있다면 여기에 추가
      // queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list() })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}
