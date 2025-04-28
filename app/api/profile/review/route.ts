//여기에 리뷰를 가져오는 supabase 코드를 작성
//
import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { Database } from '@/types/database.types'
import { ReviewsRow, UsersRow } from '@/types/database.table.types' // 필요한 테이블 타입 임포트

// API 응답으로 내려줄 리뷰 데이터 타입 (작성자 정보 포함)
export type ApiReviewData = Omit<ReviewsRow, 'reviewer_id' | 'reviewed_id' | 'request_id'> & {
    reviewer: Pick<UsersRow, 'id' | 'name' | 'profile_circle_img'> | null // 작성자 정보 추가
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { searchParams } = new URL(request.url)
  const publicProfileIdString = searchParams.get('profileId') // public_id 받기

  if (!publicProfileIdString) {
    return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
  }

  const publicProfileId = Number(publicProfileIdString)
  if (isNaN(publicProfileId)) {
      return NextResponse.json({ error: 'Invalid Profile ID format' }, { status: 400 })
  }

  try {
    // 1. public_id로 profiles 테이블에서 reviewed_user_id 찾기
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('public_id', publicProfileId)
      .single()

    if (profileError || !profileData?.user_id) {
       console.error(`[API Review] Profile not found for public_id ${publicProfileId}:`, profileError)
       // 프로필이 없는 경우 빈 배열 반환 또는 404 에러 반환 선택
       return NextResponse.json({ reviews: [] }, { status: 200 }) // 빈 배열 반환
      // return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const reviewedUserId = profileData.user_id;

    // 2. 찾은 user_id (reviewed_id)로 reviews 테이블 조회 + reviewer 정보 join
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id ( id, name, profile_circle_img )
      `) // reviewer_id를 통해 users 테이블 join
      .eq('reviewed_id', reviewedUserId) // reviewed_id 기준으로 필터링
      .order('created_at', { ascending: false }) // 최신순 정렬 (옵션)
      // .limit(10) // 필요시 페이지네이션 또는 개수 제한

    if (reviewsError) {
      console.error(`[API Review] Error fetching reviews for user ${reviewedUserId}:`, reviewsError)
      return NextResponse.json({ error: 'Failed to fetch reviews', details: reviewsError.message }, { status: 500 })
    }

    // 타입스크립트가 reviewer 타입을 제대로 추론하도록 단언 (실제 데이터 구조 확인 필요)
    const formattedReviews: ApiReviewData[] = (reviewsData || []).map(review => {
         // reviewer가 객체 형태가 아닌 경우 처리 (Join 실패 등)
        const reviewerInfo = typeof review.reviewer === 'object' && review.reviewer !== null
            ? {
                id: review.reviewer.id,
                name: review.reviewer.name,
                profile_circle_img: review.reviewer.profile_circle_img
              }
            : null;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { reviewer_id, reviewed_id, request_id, reviewer: originalReviewer, ...rest } = review; // 원본 reviewer 관련 필드 제거
        return {
            ...rest,
            reviewer: reviewerInfo // 가공된 reviewer 정보 추가
        };
    });


    return NextResponse.json({ reviews: formattedReviews }, { status: 200 })

  } catch (error: any) {
    console.error('[API Review] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}