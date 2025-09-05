import "client-only"
import { createBrowserClient } from "@supabase/ssr"

import { type Database } from "@/types/database.types"

// 싱글턴 인스턴스를 저장할 변수
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

// 싱글턴 Supabase 클라이언트 생성 함수
const getSupabaseInstance = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseInstance
}

// 기존 createClient 호출과의 호환성을 위해 유지 (내부적으로 싱글턴 반환)
export const createClient = () => {
  return getSupabaseInstance()
}

// 명시적으로 싱글턴임을 나타내는 새로운 export (선택적 사용)
export const getClient = getSupabaseInstance
