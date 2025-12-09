import "server-only"

import { createServerClientComponent, createPublicClient } from "@/supabase/functions/server"
import type { UsersRow } from "@/types/database.table.types"

// users 테이블 단일 조회(없음은 null로 표준화)
type UserMinimalProjection = Pick<UsersRow, "id" | "name" | "profile_circle_img" | "is_online">

// 인증된 사용자 정보 조회용 (authStore에서 사용)
export type AuthUserProjection = Pick<UsersRow, "id" | "profile_circle_img">

export async function repoGetUserMinimalById(
  userId: string | null | undefined,
): Promise<{ data: UserMinimalProjection | null; error: Error | null }> {
  // userId가 null/undefined/빈 문자열인 경우: 정상값(null)로 표준화하여 상위에서 404 처리하도록 위임
  if (typeof userId !== "string" || userId.trim() === "") {
    return { data: null, error: null }
  }

  const supabase = createPublicClient() // ✅ 공개 클라이언트 사용 (cookies 불필요)
  const { data, error } = await supabase
    .from("users")
    .select("id, name, profile_circle_img, is_online")
    .eq("id", userId)
    .maybeSingle()

  if (error) return { data: null, error: error as Error }
  return { data: (data as UserMinimalProjection) ?? null, error: null }
}

/**
 * 인증된 사용자의 users 테이블 정보 조회
 * - 쿠키 기반 인증 필요 (Server Action/API Route에서 호출)
 * - authStore 동기화용
 */
export async function repoGetAuthUserById(
  userId: string,
): Promise<{ data: AuthUserProjection | null; error: Error | null }> {
  if (!userId || userId.trim() === "") {
    return { data: null, error: null }
  }

  const supabase = await createServerClientComponent()
  const { data, error } = await supabase
    .from("users")
    .select("id, profile_circle_img")
    .eq("id", userId)
    .maybeSingle()

  if (error) return { data: null, error: error as Error }
  return { data: (data as AuthUserProjection) ?? null, error: null }
}
