"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Fragment } from "react";

import CategoryCard from "./_components/CategoryCard";
import { fetchGames, GamesApiResponse } from "./_api/CategoryApi";
import LoadingSpinner from "./_components/LoadingSpinner";

export default function CategoryPage() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<GamesApiResponse, Error>({
    queryKey: ["games"],
    queryFn: fetchGames,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { ref } = useInView({
    threshold: 0,
    // 뷰포트 진입(onEnter) / 이탈(onLeave) 시 호출
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
        Error loading games: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">게임 카테고리</h1>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.games.map((game) => (
              <CategoryCard
                key={game.id}
                id={game.id}
                name={game.name}
                description={game.description}
                genre={game.genre || []}
                image_url={game.image_url || "/images/default-game-icon.webp"}
              />
            ))}
          </Fragment>
        ))}
      </ul>

      {/* 무한 스크롤 트리거 및 로딩 표시 */}
      <div ref={ref} className="h-20 flex justify-center items-center mt-8">
        {isFetchingNextPage ? (
          <LoadingSpinner />
        ) : hasNextPage ? (
          <span className="text-gray-500">스크롤하여 더 보기...</span>
        ) : (
          data.pages[0].games.length > 0 && (
            <p className="text-sm text-gray-500">모든 게임을 불러왔습니다.</p>
          )
        )}
        {!hasNextPage &&
          data.pages.length > 0 &&
          data.pages[0].games.length === 0 && (
            <p className="text-sm text-gray-500">등록된 게임이 없습니다.</p>
          )}
      </div>
    </div>
  );
}
