"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { fetchAlbumImages } from "@/app/dashboard/_api/profileSectionApi"

interface AlbumImagesData {
  images: any[]
  thumbnailIndex: number
}

export function useAlbumImagesQuery(
  options?: UseQueryOptions<AlbumImagesData, Error, AlbumImagesData, ReturnType<typeof queryKeys.profile.albumImages>>
) {
  return useQuery({
    queryKey: queryKeys.profile.albumImages(),
    queryFn: fetchAlbumImages,
    staleTime: 300_000, // 5분
    refetchOnWindowFocus: false,
    ...options,
  })
}

