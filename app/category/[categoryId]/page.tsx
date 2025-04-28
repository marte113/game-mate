'use client' // Hooks 사용을 위해 클라이언트 컴포넌트로 선언

import { useParams } from 'next/navigation' // next/navigation 사용
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { Fragment, useEffect } from 'react' // Fragment, useEffect 임포트

import { fetchMates } from '../_api/mateApi' // 수정된 API 함수 임포트
import type { MatesApiResponse, MateCardData } from '../_types/categoryPage.types'
import LoadingSpinner from '../_components/LoadingSpinner' // 로딩 스피너 임포트
import { MateCard } from '../_components/MateCard' // MateCard 임포트 경로 확인
import CategoryHeader from '../_components/CategoryHeader'

export default function CategoryIdPage() {
  const params = useParams()
  // params.categoryId가 string | string[] 일 수 있으므로 string으로 처리
  const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    // status, // status는 필요 없으면 제거 가능
  } = useInfiniteQuery<
    MatesApiResponse, // TData
    Error, // TError
    InfiniteData<MatesApiResponse>, // TQueryData
    Readonly<['mates', string]>, // TQueryKey - 명시적으로 타입 지정
    number // TPageParam - 명시적으로 타입 지정
    >({
    queryKey: ['mates', categoryId], // 타입 인자와 일치
    queryFn: fetchMates,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!categoryId, // categoryId가 있을 때만 쿼리 실행
    })

  const { ref, inView } = useInView({
    threshold: 0, // 요소가 1px이라도 보이면 트리거
  })

  // inView 상태가 변경되고, 다음 페이지가 있으며, 현재 로딩 중이 아닐 때 fetchNextPage 호출
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다: {error.message}
      </div>
    )
  }

  // 데이터가 없을 경우 (초기 로딩 후)
  const allMates = data?.pages.flatMap(page => page.mates) ?? []
  const noMatesFound = !isLoading && allMates.length === 0

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryHeader/>

      {noMatesFound ? (
        <p className="text-center text-gray-500 py-10">
          아직 등록된 메이트가 없습니다.
        </p>
      ) : (
        <>
          {/* 메이트 목록 - 5열 그리드 */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data?.pages.map((page: MatesApiResponse, i) => (
              <Fragment key={i}>
                {page.mates?.map((mate: MateCardData) => (
                  <MateCard key={mate.id} mate={mate} />
                ))}
              </Fragment>
            ))}
          </div>

          {/* 무한 스크롤 트리거 및 로딩 표시 */}
          <div ref={ref} className="h-20 flex justify-center items-center mt-8">
            {isFetchingNextPage ? (
              <LoadingSpinner />
            ) : hasNextPage ? (
              // 더 로드할 메이트가 있을 때만 "스크롤하여 더 보기" 표시
              <span className="text-gray-500">스크롤하여 더 보기...</span>
            ) : (
              // 더 로드할 페이지가 없고, 데이터가 있을 때 완료 메시지 표시
              allMates.length > 0 && <p className="text-sm text-gray-500">모든 메이트를 불러왔습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}


