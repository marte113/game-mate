// 파트너 메이트 데이터를 가져오는 라우트

import { NextResponse } from 'next/server'
import { getPartnerMates } from '@/app/apis/service/mate/recommendService'
import { handleApiError } from '@/app/apis/base'

export async function GET() {
  try {
    const partnerMates = await getPartnerMates(4)
    return NextResponse.json(partnerMates)
  } catch (error) {
    return handleApiError(error)
  }
}
