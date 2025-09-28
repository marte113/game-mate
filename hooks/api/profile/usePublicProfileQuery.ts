"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { getPublicProfile } from "@/app/apis/service/profile/publicProfile.service"

type PublicProfileData = Awaited<ReturnType<typeof getPublicProfile>>
type PublicProfileKey = ReturnType<typeof queryKeys.profile.publicById>

export function usePublicProfileQuery(
  publicId: number,
  options?: Omit<
    UseQueryOptions<PublicProfileData, Error, PublicProfileData, PublicProfileKey>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.profile.publicById(publicId),
    queryFn: () => getPublicProfile(publicId),
    enabled: Number.isFinite(publicId),
    staleTime: 300_000,
    throwOnError: true,
    ...options,
  })
}
