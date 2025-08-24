import 'server-only'

import { wrapService } from '@/app/apis/base'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { insertReview } from '@/app/apis/repository/review/reviewsRepository'
import sanitizeHtml from 'sanitize-html'

type CreateReviewInput = {
  rating: number
  content?: string
  requestId: string
  reviewedId: string
}

export async function createReview(input: CreateReviewInput) {
  return wrapService('tasks.createReview', async () => {
    const userId = await getCurrentUserId()
    const { rating, content, requestId, reviewedId } = input

    if (!requestId || !reviewedId) {
      throw new Error('필수 정보 누락 (의뢰 ID 또는 리뷰 대상 ID)')
    }
    if (rating === null || rating < 1 || rating > 5) {
      throw new Error('유효하지 않은 평점입니다.')
    }

    const sanitizedContent = sanitizeHtml(content || '', { allowedTags: [], allowedAttributes: {} })
    const newReview = await insertReview({
      reviewer_id: userId,
      reviewed_id: reviewedId,
      request_id: requestId,
      rating,
      content: sanitizedContent.trim() || '후기를 작성하지 않았습니다',
      created_at: new Date().toISOString(),
    })
    return { review: newReview }
  })
}


