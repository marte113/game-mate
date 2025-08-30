import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/supabase/functions/server'
import { handleApiError, createBadRequestError, createNotFoundError } from '@/app/apis/base'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const publicIdParam = searchParams.get('publicId')
    const publicId = Number(publicIdParam)

    if (!publicIdParam || Number.isNaN(publicId)) {
      throw createBadRequestError('Invalid publicId')
    }

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


