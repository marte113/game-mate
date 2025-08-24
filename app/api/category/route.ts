import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCategoryList } from '@/app/apis/service/category/listService'

// 첫 로드시 로드할 아이템 수, 이후 페이지당 게임 카테고리를 로드할 아이템 수
const INITIAL_LOAD = 18
const LOAD_PER_PAGE = 12

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('page') ?? '0'
  const page = parseInt(raw, 10)

  if (isNaN(page) || page < 0) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 })
  }

  // 페이지별 limit/offset 계산
  const limit = page === 0 ? INITIAL_LOAD : LOAD_PER_PAGE
  const offset =
    page === 0
      ? 0
      : INITIAL_LOAD + (page - 1) * LOAD_PER_PAGE

  try {
    const result = await getCategoryList(page)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Unexpected error in GET /api/category:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
