import { type ReactNode } from "react"
import { notFound } from "next/navigation"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"
import { svcGetPublicProfile } from "@/app/apis/service/profile/profile.service.server"
import type { PrefetchedProfileData } from "@/app/profile/_types/profile.types"

// 컴포넌트 Props 타입 정의
interface ProfilePageContainerProps {
  profileId: string // 조회할 프로필의 ID
  children: ReactNode
}

export default async function ProfilePageContainer({
  profileId,
  children,
}: ProfilePageContainerProps) {
  const queryClient = new QueryClient()
  const numericProfileId = Number(profileId)
  if (!Number.isFinite(numericProfileId)) {
    notFound()
  }
  const key = queryKeys.profile.publicById(numericProfileId)

  // 서버에서 단일 I/O로 데이터 조회 및 404 판정
  const data = await svcGetPublicProfile(numericProfileId)
  if (!data) {
    notFound()
  }
  queryClient.setQueryData<PrefetchedProfileData>(key, data)

  const dehydratedState = dehydrate(queryClient)

  return (
    <main className="min-h-screen bg-base-100">
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </main>
  )
}
