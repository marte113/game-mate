//api 정의 함수는 여기로
//
import type { RecommendedMateData, PartnerMateData } from '@/types/mate.types'
import { fetchJson } from '@/libs/api/fetchJson'

/**
 * 추천 메이트 목록을 가져옵니다.
 */
export async function fetchRecommendedMates(): Promise<RecommendedMateData[]> {
  return fetchJson<RecommendedMateData[]>('/api/mate/recommend')
}

/**
 * 파트너 메이트 목록을 가져옵니다.
 */
export async function fetchPartnerMates(): Promise<PartnerMateData[]> {
  return fetchJson<PartnerMateData[]>('/api/mate/partner')
}