"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchProfileInfo, fetchProfileImage } from "@/app/dashboard/_api/profileSectionApi"
import { ProfileDataSchema } from "@/libs/schemas/profile.schema"

export function useProfileInfoQuery(
  options?: UseQueryOptions<
    ProfileDataSchema,
    Error,
    ProfileDataSchema,
    ReturnType<typeof queryKeys.profile.info>
  >,
) {
  return useQuery({
    queryKey: queryKeys.profile.info(),
    queryFn: fetchProfileInfo,
    staleTime: 600_000, // 10분 (프로필 정보는 자주 변하지 않음)
    throwOnError: true,
    ...options,
  })
}

export function useProfileImageQuery(
  options?: UseQueryOptions<any, Error, any, ReturnType<typeof queryKeys.profile.image>>,
) {
  return useQuery({
    queryKey: queryKeys.profile.image(),
    queryFn: fetchProfileImage,
    staleTime: 300_000, // 5분
    throwOnError: true,
    ...options,
  })
}
