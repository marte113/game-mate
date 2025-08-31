import { NextRequest, NextResponse } from "next/server";

import type { MatesApiResponse } from "@/app/category/_types/categoryPage.types";
import { getCategoryMates } from '@/app/apis/service/category/mateService'
import { handleApiError, createValidationError } from '@/app/apis/base'
import { categoryMatesParamsSchema, categoryMatesGetQuerySchema } from '@/libs/schemas/server/category.schema'

// 페이지 크기 및 쿼리 결과 타입은 Service로 이동

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const rawParams = await params
  const paramsParsed = categoryMatesParamsSchema.safeParse(rawParams)
  if (!paramsParsed.success) {
    const details = paramsParsed.error.flatten().fieldErrors
    throw createValidationError('요청 경로 파라미터가 유효하지 않습니다.', details)
  }
  const { categoryId } = paramsParsed.data
  const rawQuery = Object.fromEntries(request.nextUrl.searchParams)
  const queryParsed = categoryMatesGetQuerySchema.safeParse(rawQuery)
  if (!queryParsed.success) {
    const details = queryParsed.error.flatten().fieldErrors
    throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
  }
  const { page } = queryParsed.data

  try {
    const result = await getCategoryMates(categoryId, page)
    const response: MatesApiResponse = result
    return NextResponse.json(response)
  } catch (err) {
    return handleApiError(err)
  }
}

