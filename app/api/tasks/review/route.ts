import { NextResponse } from 'next/server'
import { createReview } from '@/app/apis/service/tasks/reviewService'

// POST: 새 리뷰 생성
export async function POST(request: Request) {
  try {
    const { rating, content, requestId, reviewedId } = await request.json()
    if (rating === null || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '유효하지 않은 평점입니다.' }, { status: 400 })
    }
    if (!requestId || !reviewedId) {
      return NextResponse.json({ error: '필수 정보 누락 (의뢰 ID 또는 리뷰 대상 ID)' }, { status: 400 })
    }
    const result = await createReview({ rating, content, requestId, reviewedId })
    return NextResponse.json(result)
  } catch (error) {
    console.error('리뷰 생성 API 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류 발생'
    return NextResponse.json({ error: '리뷰 처리 중 예기치 않은 오류 발생: ' + message }, { status: 500 })
  }
}

// TODO: 추후 필요 시 GET, PATCH, DELETE 핸들러 구현