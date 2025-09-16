"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import TokenHistoryTable from "./TokenHistoryTable"
import TokenHistoryListMobile from "./TokenHistoryListMobile"

export default function TokenHistoryBoundary() {
  return (
    <QuerySectionBoundary keys={queryKeys.token.transactions()}>
      {/* <div className="block sm:hidden">
        <TokenHistoryListMobile />
      </div> */}
      <div className="">
        <TokenHistoryTable />
      </div>
    </QuerySectionBoundary>
  )
}
