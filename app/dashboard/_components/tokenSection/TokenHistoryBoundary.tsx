"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import TokenHistoryTable from "./TokenHistoryTable"

export default function TokenHistoryBoundary() {
  return (
    <QuerySectionBoundary keys={queryKeys.token.transactions()}>
      <TokenHistoryTable />
    </QuerySectionBoundary>
  )
}
