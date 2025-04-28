import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types' // 경로 조정

// 첫 로드시 로드할 아이템 수, 이후 페이지당 로드할 아이템 수
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

  // 쿠키 공급자를 넘겨줘야 Route Handler Client가 동작합니다.
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookies(),
  })

  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('id, name, genre, description, image_url')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching games:', error)
      return NextResponse.json(
        { error: 'Failed to fetch games' },
        { status: 500 }
      )
    }

    // 다음 페이지 존재 여부
    const hasNextPage = (games?.length ?? 0) === limit

    return NextResponse.json({
      games: games ?? [],
      nextPage: hasNextPage ? page + 1 : undefined,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/category:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
