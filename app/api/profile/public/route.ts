import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, createValidationError, createNotFoundError } from '@/app/apis/base'
import { profilePublicGetQuerySchema } from '@/libs/schemas/server/profile.schema'
import { svcGetPublicProfile } from '@/app/apis/service/profile/profile.service.server'

export async function GET(req: NextRequest) {
  try {
    const rawQuery = Object.fromEntries(new URL(req.url).searchParams)
    const parsed = profilePublicGetQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
    }
    const { publicId } = parsed.data

    const data = await svcGetPublicProfile(publicId)
    if (!data) {
      throw createNotFoundError('Profile not found')
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    return handleApiError(err)
  }
}


