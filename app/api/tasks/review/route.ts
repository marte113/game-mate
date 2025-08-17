import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import sanitizeHtml from 'sanitize-html' // 새니타이즈 라이브러리 임포트

import { Database } from '@/types/database.types'

// POST: 새 리뷰 생성
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // 현재 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증 오류' }, { status: 401 })
    }

    // 요청 데이터 파싱
    const { rating, content, requestId, reviewedId } = await request.json()

    // 필수 값 검증 (rating은 null일 수 있으나, content 등은 필요)
    if (!requestId || !reviewedId) {
      return NextResponse.json({ error: '필수 정보 누락 (의뢰 ID 또는 리뷰 대상 ID)' }, { status: 400 })
    }
    if (rating === null || rating < 1 || rating > 5) { // rating 유효성 검사 (0.5 단위 고려)
      // rating이 null 이거나 1~5 사이가 아니면 오류 (정책에 따라 조정 가능)
       return NextResponse.json({ error: '유효하지 않은 평점입니다.' }, { status: 400 });
    }


    // 리뷰 내용 새니타이즈 (XSS 방지)
    const sanitizedContent = sanitizeHtml(content || '', {
      allowedTags: [], // 모든 HTML 태그 제거
      allowedAttributes: {} // 모든 속성 제거
    })

    // 데이터베이스에 저장할 데이터 준비
    const reviewData = {
      reviewer_id: user.id, // 현재 사용자 ID
      reviewed_id: reviewedId,
      request_id: requestId,
      rating: rating,
      // 새니타이즈된 내용 저장, 빈 내용이면 기본 메시지 저장
      content: sanitizedContent.trim() || '후기를 작성하지 않았습니다',
      created_at: new Date().toISOString() // 생성 시간 명시적 설정
    }

    // 리뷰 데이터 삽입
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select() // 삽입된 데이터 반환 요청
      .single() // 단일 행 반환

    if (insertError) {
      console.error('리뷰 삽입 오류:', insertError)
      // 제약 조건 위반 등의 오류 처리 (예: 이미 리뷰 작성됨)
      if (insertError.code === '23505') { // Unique violation
        return NextResponse.json({ error: '이미 해당 의뢰에 대한 리뷰를 작성했습니다.' }, { status: 409 }); // Conflict
      }
      return NextResponse.json({ error: '리뷰 저장 중 오류 발생: ' + insertError.message }, { status: 500 })
    }

    // 성공 응답 (생성된 리뷰 데이터 포함)
    return NextResponse.json({ review: newReview })

  } catch (error) {
    console.error('리뷰 생성 API 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류 발생'
    return NextResponse.json({ error: '리뷰 처리 중 예기치 않은 오류 발생: ' + message }, { status: 500 })
  }
}

// TODO: 추후 필요 시 GET, PATCH, DELETE 핸들러 구현