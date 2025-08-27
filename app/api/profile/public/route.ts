import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/libs/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const publicIdParam = searchParams.get('publicId')
    const publicId = Number(publicIdParam)

    if (!publicIdParam || Number.isNaN(publicId)) {
      return NextResponse.json({ error: 'Invalid publicId' }, { status: 400 })
    }

    const supabase = await createServerClientComponent()

    const { data: profileInfo, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, nickname, follower_count, description, selected_tags, youtube_urls, selected_games')
      .eq('public_id', publicId)
      .single()

    if (profileError || !profileInfo || !profileInfo.user_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('id, name, profile_circle_img, is_online')
      .eq('id', profileInfo.user_id)
      .single()

    if (userError || !userInfo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = {
      ...userInfo,
      ...profileInfo,
      user_id: userInfo.id,
      public_id: publicId,
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/profile/public] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


