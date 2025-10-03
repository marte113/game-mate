import { type ReactNode } from "react"
import { dehydrate, HydrationBoundary, QueryClient, type InfiniteData } from "@tanstack/react-query"

import { queryKeys } from "@/constants/queryKeys"

import { buildRecommendedThemes } from "@/app/apis/service/category/recommendService"
import type { RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types"
import type { PopularGamesResponse } from "@/app/category/_api/CategoryApi"
import { svcListPopularGames } from "@/app/apis/service/category/popularService"

interface HomePageContainerProps {
  children: ReactNode
}

export default async function HomePageContainer({ children }: HomePageContainerProps) {
  const queryClient = new QueryClient()

  const popularKey = queryKeys.category.popularGames()
  const recommendedKey = queryKeys.category.recommendedThemes()

  // 서버에서 필요한 데이터 미리 가져오기 (네트워크 홉 없이 서비스 레이어 직접 호출)
  const [popular, recommended] = await Promise.all([
    svcListPopularGames(6),
    buildRecommendedThemes(0),
  ])

  // 인기 게임 - 단일 쿼리 캐시 주입
  queryClient.setQueryData<PopularGamesResponse>(popularKey, popular)

  // 추천 테마 - 무한쿼리 형태로 캐시 주입
  const infiniteRecommended: InfiniteData<RecommendedThemeResponse, number> = {
    pages: [
      {
        themes: recommended.themes,
        nextPage: recommended.nextPage,
      },
    ],
    pageParams: [0],
  }
  queryClient.setQueryData<InfiniteData<RecommendedThemeResponse, number>>(
    recommendedKey,
    infiniteRecommended,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <main className="min-h-screen w-full bg-base-100">
      <div className="container mx-auto px-4 pt-6">
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      </div>
    </main>
  )
}
