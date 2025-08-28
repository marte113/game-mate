import { NextRequest, NextResponse } from "next/server";
import { getMyTokenTransactions } from '@/app/apis/service/token/transactionsService'
import { toErrorResponse } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageParam = searchParams.get('pageParam') ?? undefined
    const limit = Number(searchParams.get('limit') ?? '10')
    const result = await getMyTokenTransactions({ pageParam, limit: Number.isFinite(limit) ? limit : 10 })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
