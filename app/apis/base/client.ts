"use server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createAdmin } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

export async function getServerSupabase() {
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

/**
 * 익명 Supabase 클라이언트 (쿠키 없음, 정적 생성 가능)
 * 공개 데이터 조회 시 사용 (인기 게임, 추천 테마 등)
 */
export async function getAnonSupabase() {
  return createAdmin<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
    },
  )
}

export async function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  return createAdmin<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  })
}
