import { NextResponse, NextRequest } from 'next/server'
import { getProfileReviewsByPublicId } from '@/app/apis/service/profile/reviewService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const publicProfileIdString = searchParams.get('profileId')
  if (!publicProfileIdString) {
    return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
  }
  const publicProfileId = Number(publicProfileIdString)
  if (isNaN(publicProfileId)) {
    return NextResponse.json({ error: 'Invalid Profile ID format' }, { status: 400 })
  }
  try {
    const result = await getProfileReviewsByPublicId(publicProfileId)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('[API Review] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}