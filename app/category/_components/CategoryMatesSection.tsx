"use client"

import { useMemo } from "react"
import { useInView } from "react-intersection-observer"

import { useMatesByCategoryInfiniteQuery } from "@/hooks/api/category/useCategoryQueries"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

import type { MateCardData } from "../_types/categoryPage.types"
import { MatesProvider } from "../_context/MatesContexts"

import MatesGrid from "./MatesGrid"
import InfiniteFooter from "./InfiniteFooter"

export default function CategoryMatesSection({ categoryId }: { categoryId: string }) {
  const { data, error, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useMatesByCategoryInfiniteQuery(categoryId)

  const mates: ReadonlyArray<MateCardData> = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.mates),
    [data],
  )

  const noMates = !isLoading && mates.length === 0

  const matesValue = useMemo(() => ({ mates }), [mates])
  const paginationValue = useMemo(
    () => ({
      total: mates.length,
      hasNextPage: !!hasNextPage,
      isFetchingNextPage,
    }),
    [mates.length, hasNextPage, isFetchingNextPage],
  )

  const { ref } = useInView({
    rootMargin: "400px 0px",
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="text-center py-10 text-red-500">
        메이트 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  if (noMates) {
    return <p className="text-center text-gray-500 py-10">아직 등록된 메이트가 없습니다.</p>
  }

  return (
    <MatesProvider value={matesValue} pagination={paginationValue}>
      <MatesGrid />
      <InfiniteFooter observeRef={ref} />
    </MatesProvider>
  )
}
