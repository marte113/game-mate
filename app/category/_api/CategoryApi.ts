//Category 페이지에서 사용할 api 파일
//

import type { QueryFunctionContext } from '@tanstack/react-query' // QueryFunctionContext 임포트

import type { GamesRow } from '@/types/database.table.types' // 테이블 타입 경로 확인
import type { Database } from '@/types/database.types' // Database 타입 추가

import { GameHeader } from '../_types/categoryPage.types'

export interface GamesApiResponse {
  games: GamesRow[] // 실제 Games 테이블 Row 타입 사용
  nextPage: number | undefined
}

// Supabase 원본 타입 활용
type GamesTableRow = Database['public']['Tables']['games']['Row']

// 인기 게임 타입 - Supabase 타입 조합으로 생성
export type PopularGame = Pick<GamesTableRow, 'id' | 'name' | 'description' | 'image_url'> & {
  player_count: number; // null을 제거하고 number로 고정
}

export interface PopularGamesResponse {
  games: PopularGame[]
}

// queryKey 타입을 readonly ['games'] 로 수정
export const fetchGames = async (
  context: QueryFunctionContext<readonly ['games'], number> // readonly 추가
): Promise<GamesApiResponse> => {
  // context 객체에서 pageParam 추출 (첫 페이지는 undefined일 수 있으므로 기본값 0 설정)
  const { pageParam = 0 } = context

  const response = await fetch(`/api/category?page=${pageParam}`)

  if (!response.ok) {
    // 실제 프로덕션에서는 status code에 따른 분기 처리 고려
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: GamesApiResponse = await response.json()
  return data
}

export const fetchGameHeader = async (
   // readonly 추가
   categoryId: string
) => {

  const response = await fetch(`/api/category/${categoryId}/header`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: GameHeader = await response.json()
  return data;
}

// 인기 게임 목록 조회 함수
export const fetchPopularGames = async (limit: number = 6): Promise<PopularGamesResponse> => {
  const response = await fetch(`/api/category/popular?limit=${limit}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch popular games: ${response.status}`)
  }
  
  return response.json()
}
