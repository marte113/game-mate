"use server"

import { createServerClientComponent } from "@/supabase/functions/server"
import {
  repoGetAuthUserById,
  type AuthUserProjection,
} from "@/app/apis/repository/user/user.repository.server"
import {
  repoGetAuthProfileByUserId,
  type AuthProfileProjection,
} from "@/app/apis/repository/profile/profile.repository.server"

// Server Action 응답 타입
export type AuthUserData = {
  user: AuthUserProjection | null
  profile: AuthProfileProjection | null
  error: string | null
}

/**
 * 인증된 사용자의 user/profile 데이터를 조회하는 Server Action
 * - 클라이언트(authStore)에서 호출
 * - DB 쿼리는 서버에서만 실행됨 (Vault & Gateway 패턴)
 */
export async function getAuthenticatedUserData(): Promise<AuthUserData> {
  try {
    const supabase = await createServerClientComponent()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    // 인증 에러 또는 미로그인
    if (authError || !authUser) {
      return { user: null, profile: null, error: null }
    }

    // Repository 레이어를 통해 user/profile 조회
    const [userRes, profileRes] = await Promise.all([
      repoGetAuthUserById(authUser.id),
      repoGetAuthProfileByUserId(authUser.id),
    ])

    // 에러 처리
    if (userRes.error) {
      return { user: null, profile: null, error: userRes.error.message }
    }
    if (profileRes.error) {
      return { user: null, profile: null, error: profileRes.error.message }
    }

    return {
      user: userRes.data,
      profile: profileRes.data,
      error: null,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "사용자 정보 조회 실패"
    return { user: null, profile: null, error: msg }
  }
}
