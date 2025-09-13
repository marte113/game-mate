"use client"

import { useCallback, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
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

export function useUserSearchLive(initialLimit = 8) {
  const qRef = useRef("")
  const limitRef = useRef(initialLimit)

  const query = useQuery({
    queryKey: queryKeys.search.users("live"),
    enabled: false, // 수동 refetch만 사용
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: async ({ signal }): Promise<UserSearchResponse> => {
      const q = qRef.current
      const limit = String(limitRef.current)
      const params = new URLSearchParams({ q, limit })
      const res = await fetch(`/api/search/users?${params.toString()}`, { signal })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "사용자 검색에 실패했습니다")
      }
      return (await res.json()) as UserSearchResponse
    },
  })

  const search = useCallback(
    (q: string) => {
      const v = q.trim()
      qRef.current = v
      if (v.length >= 2) {
        void query.refetch()
      }
    },
    [query],
  )

  return {
    ...query,
    search,
  }
}
