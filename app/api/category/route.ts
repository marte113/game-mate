import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCategoryList } from '@/app/apis/service/category/listService'
import { handleApiError, createValidationError } from '@/app/apis/base'
import { categoryListGetQuerySchema } from '@/libs/schemas/server/category.schema'

// 첫 로드시 로드할 아이템 수, 이후 페이지당 게임 카테고리를 로드할 아이템 수
const INITIAL_LOAD = 18
const LOAD_PER_PAGE = 12

export async function GET(request: NextRequest) {
  const rawQuery = Object.fromEntries(new URL(request.url).searchParams)
  const parsed = categoryListGetQuerySchema.safeParse(rawQuery)
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors
    throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
  }
  const { page } = parsed.data

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
    return handleApiError(err)
  }
}
