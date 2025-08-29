"use client"

import { UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchRecommendedMates, fetchPartnerMates } from "@/components/ui/sidebar/mateApi"
import type { RecommendedMateData, PartnerMateData } from "@/types/mate.types"
import { useAppQuery } from "@/hooks/api/core/useAppQuery"

export function useRecommendedMatesQuery(
  options?: UseQueryOptions<RecommendedMateData[], Error, RecommendedMateData[], ReturnType<typeof queryKeys.mates.recommended>>
) {
  return useAppQuery({
    queryKey: queryKeys.mates.recommended(),
    queryFn: fetchRecommendedMates,
    staleTime: 300_000, // 5분 (메이트 추천은 적당히 자주 갱신)
    ...options,
  })
}

export function usePartnerMatesQuery(
  options?: UseQueryOptions<PartnerMateData[], Error, PartnerMateData[], ReturnType<typeof queryKeys.mates.partner>>
) {
  return useAppQuery({
    queryKey: queryKeys.mates.partner(),
    queryFn: fetchPartnerMates,
    staleTime: 600_000, // 10분 (파트너는 조금 덜 자주 갱신)
    ...options,
  })
}
