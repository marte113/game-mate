import { NextResponse } from 'next/server'

import { getMyTokenBalance } from '@/app/apis/service/token/balanceService'
import { handleApiError } from '@/app/apis/base'

export async function GET() {
  try {
    const result = await getMyTokenBalance()
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
