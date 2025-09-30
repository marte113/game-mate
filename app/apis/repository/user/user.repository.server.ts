import "server-only"
import { createServerClientComponent } from "@/supabase/functions/server"
import type { UsersRow } from "@/types/database.table.types"

// users 테이블 단일 조회(없음은 null로 표준화)
type UserMinimalProjection = Pick<UsersRow, "id" | "name" | "profile_circle_img" | "is_online">

export async function repoGetUserMinimalById(
  userId: string | null | undefined,
): Promise<{ data: UserMinimalProjection | null; error: Error | null }> {
  // userId가 null/undefined/빈 문자열인 경우: 정상값(null)로 표준화하여 상위에서 404 처리하도록 위임
  if (typeof userId !== "string" || userId.trim() === "") {
    return { data: null, error: null }
  }

  const supabase = await createServerClientComponent()
  const { data, error } = await supabase
    .from("users")
    .select("id, name, profile_circle_img, is_online")
    .eq("id", userId)
    .maybeSingle()

  if (error) return { data: null, error: error as Error }
  return { data: (data as UserMinimalProjection) ?? null, error: null }
}
