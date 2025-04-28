import type { QueryFunctionContext } from '@tanstack/react-query'

import type { MatesApiResponse } from '@/app/category/_types/categoryPage.types'

// queryKey 타입을 readonly ['mates', string] 형태로 수정하고, pageParam 타입을 number로 명시
export const fetchMates = async (
  context: QueryFunctionContext<readonly ['mates', string], number> // queryKey: ['mates', categoryId], pageParam: number
): Promise<MatesApiResponse> => {
  const [_key, categoryId] = context.queryKey // queryKey에서 categoryId 추출
  const pageParam = context.pageParam ?? 0 // pageParam 기본값 0

  // categoryId가 유효한지 확인
  if (!categoryId) {
    // categoryId가 없는 경우 빈 결과를 반환하거나 에러 대신 기본 상태를 유지하도록 처리
    // 예를 들어, useInfiniteQuery의 enabled 옵션과 함께 사용될 때 불필요한 에러 방지
     console.warn('fetchMates called without categoryId, returning empty response.');
     return { mates: [], nextPage: undefined };
    // 또는 throw new Error('Category ID is required') // 이전 로직 유지 시
  }

  // API 경로 수정 ('mates'로 변경 제안했었으나, 현재 파일명 'mate' 유지)
  const response = await fetch(`/api/category/${categoryId}/mate?page=${pageParam}`) // 파일명이 route.ts면 /mate, 폴더명이면 /mates

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    // 에러 메시지를 좀 더 구체적으로 표시
    const errorMessage = errorData.error || `Failed to fetch mates for category ${categoryId}`
    console.error(`HTTP error! status: ${response.status}, message: ${errorMessage}`)
    throw new Error(errorMessage) // 실제 에러 객체 throw
  }

  try {
    const data: MatesApiResponse = await response.json()
    return data
  } catch (e) {
    console.error('Failed to parse JSON response:', e)
    throw new Error('Invalid response from server')
  }
}
