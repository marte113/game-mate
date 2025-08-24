// 추천 메이트 데이터를 가져오는 라우트

import { NextResponse } from 'next/server'
import { getSimpleRecommendedMates } from '@/app/apis/service/mate/recommendService'

// 추천 메이트 데이터 타입 정의 (필요한 필드만 선택)
export type RecommendedMateData = {
  public_id: number
  nickname: string | null
  profileImageUrl: string | null
  firstGame: string | null
  isOnline: boolean | null
}

export async function GET() {
  try {
    const recommended = await getSimpleRecommendedMates(5)
    return NextResponse.json(recommended)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '추천 메이트 정보를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
