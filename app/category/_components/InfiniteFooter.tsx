"use client"
import type { RefCallback } from "react"

import LoadingSpinner from "@/components/ui/LoadingSpinner"

import { usePagination } from "../_context/MatesContexts"

export default function InfiniteFooter({
  observeRef,
}: {
  observeRef: RefCallback<HTMLDivElement>
}) {
  const { isFetchingNextPage, hasNextPage, total } = usePagination()

  return (
    <div ref={observeRef} className="h-20 flex justify-center items-center mt-8">
      {isFetchingNextPage ? (
        <LoadingSpinner />
      ) : hasNextPage ? (
        <span className="text-gray-500">스크롤하여 더 보기...</span>
      ) : total > 0 ? (
        <p className="text-sm text-gray-500">모든 메이트를 불러왔습니다.</p>
      ) : null}
    </div>
  )
}
