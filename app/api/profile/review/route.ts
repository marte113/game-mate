import { NextResponse, NextRequest } from 'next/server'
import { getProfileReviewsByPublicId } from '@/app/apis/service/profile/reviewService'
import { handleApiError, createValidationError } from '@/app/apis/base'
import { profileReviewsGetQuerySchema } from '@/libs/schemas/server/review.schema'

export async function GET(request: NextRequest) {
  const rawQuery = Object.fromEntries(new URL(request.url).searchParams)
  const parsed = profileReviewsGetQuerySchema.safeParse(rawQuery)
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors
    throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
  }
  const { profileId } = parsed.data
  const publicProfileId = profileId
  try {
    const result = await getProfileReviewsByPublicId(publicProfileId)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return handleApiError(error)
  }
}