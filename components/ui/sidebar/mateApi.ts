//api 정의 함수는 여기로
//
import { RecommendedMateData } from '@/app/api/mate/recommend/route'
import { PartnerMateData } from '@/app/api/mate/partner/route'

/**
 * 추천 메이트 목록을 가져옵니다.
 */
export async function fetchRecommendedMates(): Promise<RecommendedMateData[]> {
  const response = await fetch('/api/mate/recommend')
  if (!response.ok) {
    // 실제 프로덕션에서는 좀 더 정교한 에러 처리가 필요할 수 있습니다.
    console.error('Failed to fetch recommended mates:', response.statusText)
    throw new Error('추천 메이트 정보를 불러오는데 실패했습니다.')
  }
  return response.json()
}

/**
 * 파트너 메이트 목록을 가져옵니다.
 */
export async function fetchPartnerMates(): Promise<PartnerMateData[]> {
  const response = await fetch('/api/mate/partner')
  if (!response.ok) {
    console.error('Failed to fetch partner mates:', response.statusText)
    throw new Error('파트너 메이트 정보를 불러오는데 실패했습니다.')
  }
  return response.json()
}