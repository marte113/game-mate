// app/dashboard/_api/reviewApi.ts
import { Database } from '@/types/database.types'

// reviews 테이블의 Row 타입을 가져옵니다. (database.types.ts 기반)
type Review = Database['public']['Tables']['reviews']['Row']

export interface CreateReviewRequest {
  rating: number | null // 별점 (null 가능성 처리)
  content: string
  requestId: string
  reviewedId: string
}

export interface ReviewResponse {
  review: Review // 생성된 리뷰 데이터 반환 타입
}

export const reviewApi = {
  // 새 리뷰 생성
  createReview: async (reviewData: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await fetch('/api/tasks/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '리뷰 생성에 실패했습니다')
    }

    return await response.json()
  }

  // TODO: 추후 필요 시 리뷰 조회(GET), 수정(PATCH), 삭제(DELETE) 함수 추가
}