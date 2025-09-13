"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/constants/queryKeys"

export type UserSearchItem = {
  profile_id: string
  public_id: number
  user_id: string
  username: string | null
  nickname: string | null
  profile_circle_img: string | null
  is_online: boolean | null
  name: string | null
}

export interface UserSearchResponse {
  items: UserSearchItem[]
}

type Options = Omit<
  UseQueryOptions<
    UserSearchResponse,
    Error,
    UserSearchResponse,
    ReturnType<typeof queryKeys.search.users>
  >,
  "queryKey" | "queryFn"
>

export function useUserSearch(q: string, limit = 8, options?: Options) {
  const qKey = q.trim().toLowerCase()
  return useQuery({
    queryKey: queryKeys.search.users(qKey),
    queryFn: async () => {
      const params = new URLSearchParams({ q, limit: String(limit) })
      const res = await fetch(`/api/search/users?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "사용자 검색에 실패했습니다")
      }
      return (await res.json()) as UserSearchResponse
    },
    enabled: qKey.length >= 2,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  })
}
