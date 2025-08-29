import type { QueryFunctionContext } from '@tanstack/react-query'

import type { MatesApiResponse } from '@/app/category/_types/categoryPage.types'
import { fetchJson } from '@/libs/api/fetchJson'

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
  return fetchJson<MatesApiResponse>(`/api/category/${categoryId}/mate?page=${pageParam}`)
}
