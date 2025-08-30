import { NextRequest, NextResponse } from "next/server";
import { getMyTokenTransactions } from '@/app/apis/service/token/transactionsService'
import { handleApiError } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageParam = searchParams.get('pageParam') ?? undefined
    const limitRaw = Number(searchParams.get('limit') ?? '10')
    const pageSize = Number.isFinite(limitRaw) ? limitRaw : 10

    // limit+1로 조회해 다음 페이지 존재 여부 판단
    const result = await getMyTokenTransactions({ pageParam, limit: pageSize + 1 })
    const rows = result.data ?? []
    const hasMore = rows.length > pageSize
    const items = hasMore ? rows.slice(0, pageSize) : rows
    const nextCursor = hasMore ? items[items.length - 1]?.created_at : undefined

    return NextResponse.json({
      success: true,
      data: {
        items,
        nextCursor,
        hasMore,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
