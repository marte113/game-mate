"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchAlbumImages, fetchPublicAlbumImages } from "@/app/dashboard/_api/profileSectionApi"

interface AlbumImagesData {
  images: any[]
  thumbnailIndex: number
}

export function useAlbumImagesQuery(
  options?: UseQueryOptions<
    AlbumImagesData,
    Error,
    AlbumImagesData,
    ReturnType<typeof queryKeys.profile.albumImages>
  >,
) {
  return useQuery({
    queryKey: queryKeys.profile.albumImages(),
    queryFn: fetchAlbumImages,
    staleTime: 300_000, // 5분
    refetchOnWindowFocus: false,
    ...options,
  })
}

// 특정 사용자(userId)의 공개 프로필 앨범 이미지를 조회하는 훅
export function usePublicAlbumImagesQuery(
  userId: string,
  options?: UseQueryOptions<
    AlbumImagesData,
    Error,
    AlbumImagesData,
    ReturnType<typeof queryKeys.profile.albumImagesPublic>
  >,
) {
  return useQuery({
    queryKey: queryKeys.profile.albumImagesPublic(userId),
    queryFn: () => fetchPublicAlbumImages(userId),
    enabled: !!userId,
    staleTime: 300_000, // 5분
    refetchOnWindowFocus: false,
    ...options,
  })
}
