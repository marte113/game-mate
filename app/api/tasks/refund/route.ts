import { NextResponse } from 'next/server'
import { refundTokens } from '@/app/apis/service/tasks/refundService'

export async function POST(request: Request) {
  try {
    const { requestId, amount } = await request.json()
    const result = await refundTokens({ requestId, amount })
    return NextResponse.json(result)
  } catch (error) {
    console.error('토큰 반환 중 오류 발생:', error)
    return NextResponse.json(
      { error: '토큰 반환에 실패했습니다.' },
      { status: 500 }
    )
  }
}   