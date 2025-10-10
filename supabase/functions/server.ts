import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database.types"

// 서버 컴포넌트에서 사용할 Supabase 클라이언트
export const createServerClientComponent = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
    },
  )
}

// 서버 액션에서 사용할 Supabase 클라이언트
export const createActionClient = async (cookieStore: ReturnType<typeof cookies>) => {
  const resolvedCookieStore = await cookieStore

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return resolvedCookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            resolvedCookieStore.set(name, value, options)
          })
        },
      },
    },
  )
}

// API 라우트에서 사용할 간편한 createClient 함수
export const createClient = async () => {
  return createServerClientComponent()
}

/**
 * 공개 데이터 조회용 Supabase 클라이언트
 * - @supabase/supabase-js 직접 사용 (SSR 패키지 불필요)
 * - cookies 없음 (인증 불필요한 공개 데이터 전용)
 * - unstable_cache 내부에서 안전하게 사용 가능
 * - RLS anon 역할로 공개 데이터 접근
 * - 사용 사례: 공개 프로필, 카테고리, 게임 목록 등
 */
export const createPublicClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
