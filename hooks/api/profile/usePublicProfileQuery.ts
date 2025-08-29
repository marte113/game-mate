"use client"

import { UseQueryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/constants/queryKeys'
import { getPublicProfile } from '@/app/apis/service/profile/publicProfile.service'
import { useAppQuery } from '@/hooks/api/core/useAppQuery'

type PublicProfileData = Awaited<ReturnType<typeof getPublicProfile>>
type PublicProfileKey = ReturnType<typeof queryKeys.profile.publicById>

export function usePublicProfileQuery(
  publicId: number,
  options?: Omit<
    UseQueryOptions<PublicProfileData, Error, PublicProfileData, PublicProfileKey>,
    'queryKey' | 'queryFn'
  >
) {
  return useAppQuery({
    queryKey: queryKeys.profile.publicById(publicId),
    queryFn: () => getPublicProfile(publicId),
    enabled: Number.isFinite(publicId),
    staleTime: 300_000,
    ...options,
  })
}


