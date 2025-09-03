"use client";

import { useMemo, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

import { useGamesInfiniteQuery } from "@/hooks/api/category/useCategoryQueries";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { GamesProvider, PaginationProvider } from "./CategoryDataContexts";

export default function CategoryPageContainer({
  children,
}: {
  children: ReactNode;
}) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    status,
  } = useGamesInfiniteQuery();

  // data 기반으로만 평탄화하여 value 변경 최소화
  const games = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.games),
    [data]
  );
  const total = games.length;

  const { ref } = useInView({
    rootMargin: "400px 0px",
    threshold: 0,
    // 뷰포트 진입 시 다음 페이지 프리페치
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-red-500 py-10">
        Error loading games: {error?.message}
      </div>
    );
  }

  const gamesValue = useMemo(() => ({ games }), [games]);
  const paginationValue = useMemo(
    () => ({
      total,
      hasNextPage: !!hasNextPage,
      isFetchingNextPage,
    }),
    [total, hasNextPage, isFetchingNextPage]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">게임 카테고리</h1>
      <GamesProvider value={gamesValue}>
        <PaginationProvider value={paginationValue}>{children}</PaginationProvider>
      </GamesProvider>

      {/* 무한 스크롤 트리거 및 로딩 표시 */}
      <div ref={ref} className="h-20 flex justify-center items-center mt-8">
        {isFetchingNextPage ? (
          <LoadingSpinner />
        ) : hasNextPage ? (
          <span className="text-gray-500">스크롤하여 더 보기...</span>
        ) : total > 0 ? (
          <p className="text-sm text-gray-500">모든 게임을 불러왔습니다.</p>
        ) : (
          <p className="text-sm text-gray-500">등록된 게임이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
