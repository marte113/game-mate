// 파트너 메이트 데이터를 가져오는 라우트

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'

// 파트너 메이트 데이터 타입 정의
export type PartnerMateData = {
  public_id: number
  nickname: string | null
  profileImageUrl: string | null
  isOnline: boolean | null
}

export async function GET() {
  const cookieStore = cookies()
  // 익명 접근 가능한 클라이언트 또는 RLS 설정 필요
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // 파트너 로직: is_partner = true (이 컬럼이 profiles 테이블에 있다고 가정)
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        public_id,
        nickname,
        users (
          profile_circle_img,
          is_online
        )
      `)
      .eq('is_partner', true) // is_partner 컬럼 사용
      .limit(4) // 최대 4명

    if (error) {
      console.error('Error fetching partner mates:', error)
      throw error
    }

    // 데이터 가공
    const partnerMates: PartnerMateData[] = data
      .filter(profile => profile.users !== null && !Array.isArray(profile.users))
      .map(profile => {
        const userData = profile.users as Database['public']['Tables']['users']['Row'] | null;
        return {
          public_id: profile.public_id!,
          nickname: profile.nickname,
          profileImageUrl: userData?.profile_circle_img ?? null,
          isOnline: userData?.is_online ?? null
        }
      });

    return NextResponse.json(partnerMates)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '파트너 메이트 정보를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
