// 추천 메이트 데이터를 가져오는 라우트

import { NextResponse } from 'next/server'
import { getSimpleRecommendedMates } from '@/app/apis/service/mate/recommendService'
import { handleApiError } from '@/app/apis/base'

export async function GET() {
  try {
    const recommended = await getSimpleRecommendedMates(5)
    return NextResponse.json(recommended)
  } catch (error) {
    return handleApiError(error)
  }
}
