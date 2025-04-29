// 추천 메이트 데이터를 가져오는 라우트

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { Database } from '@/types/database.types'

// 추천 메이트 데이터 타입 정의 (필요한 필드만 선택)
export type RecommendedMateData = {
  public_id: number
  nickname: string | null
  profileImageUrl: string | null
  firstGame: string | null
  isOnline: boolean | null
}

export async function GET() {
  const cookieStore = cookies()
  // 주의: 추천 메이트는 로그인 여부와 관계 없으므로,
  // 익명 사용자도 읽을 수 있도록 RLS 정책 설정 또는 service_role 키 사용 필요
  // 여기서는 createRouteHandlerClient를 사용하지만, 실제로는
  // 익명 접근이 가능하도록 설정된 클라이언트 또는 service_role 클라이언트 사용 고려
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // 임시 추천 로직: is_mate = true 인 사용자 중 랜덤 5명
    // 추후 더 정교한 추천 로직으로 변경 가능 (예: 팔로워 수, 활동량 등)
    // profiles와 users 테이블 조인 필요
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        public_id,
        nickname,
        selected_games,
        users (
          profile_circle_img,
          is_online
        )
      `)
      .eq('is_mate', true)
      .limit(5) // 최대 5명

    if (error) {
      console.error('Error fetching recommended mates:', error)
      throw error
    }

    // 데이터 가공
    const recommendedMates: RecommendedMateData[] = data
      // users 정보가 있는 경우만 필터링 (null 체크)
      .filter(profile => profile.users !== null && !Array.isArray(profile.users))
      .map(profile => {
        // users가 객체인지 다시 한번 확인 (TypeScript 타입 가드)
        const userData = profile.users as Database['public']['Tables']['users']['Row'] | null;
        return {
          public_id: profile.public_id!, // user_id는 non-null 이라고 가정
          nickname: profile.nickname,
          profileImageUrl: userData?.profile_circle_img ?? null,
          firstGame: profile.selected_games ? profile.selected_games[0] : null,
          isOnline: userData?.is_online ?? null
        }
      });

    return NextResponse.json(recommendedMates)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '추천 메이트 정보를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
