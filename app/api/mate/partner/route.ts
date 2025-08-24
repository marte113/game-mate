// 파트너 메이트 데이터를 가져오는 라우트

import { NextResponse } from 'next/server'
import { getPartnerMates } from '@/app/apis/service/mate/recommendService'

// 파트너 메이트 데이터 타입 정의
export type PartnerMateData = {
  public_id: number
  nickname: string | null
  profileImageUrl: string | null
  isOnline: boolean | null
}

export async function GET() {
  try {
    const partnerMates = await getPartnerMates(4)
    return NextResponse.json(partnerMates)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '파트너 메이트 정보를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
