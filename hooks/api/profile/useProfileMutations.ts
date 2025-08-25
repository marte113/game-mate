"use client"

import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import {
  updateProfileInfo,
  updateProfileImage,
  ProfileDataSchema
} from "@/app/dashboard/_api/profileSectionApi"

export function useUpdateProfileMutation(
  options?: UseMutationOptions<any, Error, Partial<ProfileDataSchema>>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfileInfo,
    onSuccess: (data, variables) => {
      // 성공 시 프로필 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.info() })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}

export function useUpdateProfileImageMutation(
  options?: UseMutationOptions<any, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfileImage,
    onSuccess: (data, variables) => {
      // 성공 시 프로필 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.image() })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}
