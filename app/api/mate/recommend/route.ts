// 추천 메이트 데이터를 가져오는 라우트

import { NextResponse } from 'next/server'
import { getSimpleRecommendedMates } from '@/app/apis/service/mate/recommendService'

export async function GET() {
  try {
    const recommended = await getSimpleRecommendedMates(5)
    return NextResponse.json(recommended)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '추천 메이트 정보를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
