import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/supabase/functions/server'
import { handleApiError, createValidationError, createNotFoundError } from '@/app/apis/base'
import { profilePublicGetQuerySchema } from '@/libs/schemas/server/profile.schema'

export async function GET(req: NextRequest) {
  try {
    const rawQuery = Object.fromEntries(new URL(req.url).searchParams)
    const parsed = profilePublicGetQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors
      throw createValidationError('요청 파라미터가 유효하지 않습니다.', details)
    }
    const { publicId } = parsed.data

    const supabase = await createServerClientComponent()

    const { data: profileInfo, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, nickname, follower_count, description, selected_tags, youtube_urls, selected_games')
      .eq('public_id', publicId)
      .single()

    if (profileError || !profileInfo || !profileInfo.user_id) {
      throw createNotFoundError('Profile not found')
    }

    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('id, name, profile_circle_img, is_online')
      .eq('id', profileInfo.user_id)
      .single()

    if (userError || !userInfo) {
      throw createNotFoundError('User not found')
    }

    const data = {
      ...userInfo,
      ...profileInfo,
      user_id: userInfo.id,
      public_id: publicId,
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    return handleApiError(err)
  }
}


