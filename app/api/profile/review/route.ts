import { NextResponse, NextRequest } from 'next/server'
import { getProfileReviewsByPublicId } from '@/app/apis/service/profile/reviewService'
import { handleApiError, createBadRequestError } from '@/app/apis/base'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const publicProfileIdString = searchParams.get('profileId')
  if (!publicProfileIdString) {
    throw createBadRequestError('Profile ID is required')
  }
  const publicProfileId = Number(publicProfileIdString)
  if (isNaN(publicProfileId)) {
    throw createBadRequestError('Invalid Profile ID format')
  }
  try {
    const result = await getProfileReviewsByPublicId(publicProfileId)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return handleApiError(error)
  }
}