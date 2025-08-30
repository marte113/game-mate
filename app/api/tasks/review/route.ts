import { NextResponse } from 'next/server'
import { createReview } from '@/app/apis/service/tasks/reviewService'
import { handleApiError, createBadRequestError } from '@/app/apis/base'

// POST: 새 리뷰 생성
export async function POST(request: Request) {
  try {
    const { rating, content, requestId, reviewedId } = await request.json()
    if (rating === null || rating < 1 || rating > 5) {
      throw createBadRequestError('유효하지 않은 평점입니다.')
    }
    if (!requestId || !reviewedId) {
      throw createBadRequestError('필수 정보 누락 (의뢰 ID 또는 리뷰 대상 ID)')
    }
    const result = await createReview({ rating, content, requestId, reviewedId })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

// TODO: 추후 필요 시 GET, PATCH, DELETE 핸들러 구현