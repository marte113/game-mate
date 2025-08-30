import { NextResponse } from 'next/server'
import { createReview } from '@/app/apis/service/tasks/reviewService'
import { handleApiError, createValidationError } from '@/app/apis/base'
import { createReviewBodySchema } from '@/libs/schemas/server/review.schema'

// POST: 새 리뷰 생성
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => undefined)
    const parsed = createReviewBodySchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 본문이 유효하지 않습니다.', details)
    }
    const { rating, content, requestId, reviewedId } = parsed.data
    const result = await createReview({ rating, content, requestId, reviewedId })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

// TODO: 추후 필요 시 GET, PATCH, DELETE 핸들러 구현