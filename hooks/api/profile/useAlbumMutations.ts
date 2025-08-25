"use client"

import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import {
  uploadAlbumImage,
  deleteAlbumImage,
  setAlbumImageAsThumbnail
} from "@/app/dashboard/_api/profileSectionApi"

export function useUploadAlbumImageMutation(
  options?: UseMutationOptions<any, Error, { file: File; index: number }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, index }) => uploadAlbumImage(file, index),
    onSuccess: (data, variables) => {
      // 성공 시 앨범 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.albumImages() })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}

export function useDeleteAlbumImageMutation(
  options?: UseMutationOptions<any, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAlbumImage,
    onSuccess: (data, variables) => {
      // 성공 시 앨범 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.albumImages() })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}

export function useSetAlbumImageAsThumbnailMutation(
  options?: UseMutationOptions<any, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setAlbumImageAsThumbnail,
    onSuccess: (data, variables) => {
      // 성공 시 앨범 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.albumImages() })

      // 옵션의 onSuccess도 실행
      options?.onSuccess?.(data, variables, undefined)
    },
    ...options,
  })
}
