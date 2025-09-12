"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"
import { useAuthStore } from "@/stores/authStore"

import TokenSummaryCard from "./TokenSummaryCard"

export default function TokenSummaryBoundary() {
  const { user } = useAuthStore()
  const userId = user?.id

  if (!userId) return <TokenSummaryCard />

  return (
    <QuerySectionBoundary keys={[queryKeys.token.balanceHeader(userId), queryKeys.token.usage()]}>
      <TokenSummaryCard />
    </QuerySectionBoundary>
  )
}
