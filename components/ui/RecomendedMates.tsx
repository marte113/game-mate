//RecommendMates 컴포넌트
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { Fragment } from 'react'

import { fetchRecommendedThemes } from '@/app/(home)/_api/homeApi'
import RecommendedMatesSlider from '@/components/RecommendedMatesSlider'
import { RecommendedThemeResponse } from '@/app/(home)/_types/homePage.types'

export default function RecommendedMates() {
  // 추천 테마 및 메이트 데이터 가져오기
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['recommendedThemes'],
    queryFn: ({ pageParam }) => fetchRecommendedThemes({ pageParam: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  // 무한 스크롤을 위한 InView 설정 (useInfiniteQuery 후에 정의)
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  })

  // 로딩 상태
  if (isLoading) {
    return (
      <section className="py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-40">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    )
  }

  const allThemes = data?.pages.flatMap(page => page.themes) || []
  console.log("allThemes", allThemes);

  return (
    <>
      {allThemes.map((theme) => (
        <RecommendedMatesSlider 
          key={theme.id} 
          theme={theme} 
          mates={theme.mates}
        />
      ))}
      
      {/* 무한 스크롤 트리거 */}
      <div 
        ref={ref} 
        className="flex items-center justify-center py-4 h-20"
      >
        {isFetchingNextPage ? (
          <div className="loading loading-spinner loading-md"></div>
        ) : hasNextPage ? (
          <span className="text-sm text-gray-500">더 많은 테마 불러오는 중...</span>
        ) : (
          allThemes.length > 0 && (
            <span className="text-sm text-gray-500">모든 테마를 불러왔습니다</span>
          )
        )}
      </div>
    </>
  )
}
