import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Session, Provider } from "@supabase/supabase-js"

import { createClient } from "@/supabase/functions/client"
import { getAuthenticatedUserData } from "@/app/actions/auth"
import type { AuthUserProjection } from "@/app/apis/repository/user/user.repository.server"
import type { AuthProfileProjection } from "@/app/apis/repository/profile/profile.repository.server"

// ─────────────────────────────────────────────────────────
// State & Actions 타입 정의
// ─────────────────────────────────────────────────────────

type AuthActions = {
  loginWithOAuth: (provider: Provider) => Promise<void>
  logout: () => Promise<void>
  syncUserProfile: (session: Session | null) => Promise<void>
  initialize: () => () => void
}

type AuthState = {
  session: Session | null
  user: AuthUserProjection | null
  profile: AuthProfileProjection | null
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  actions: AuthActions
}

const initialState = {
  session: null,
  user: null,
  profile: null,
  isLoaded: false,
  isLoading: false,
  error: null,
}

// ─────────────────────────────────────────────────────────
// Store 생성
// ─────────────────────────────────────────────────────────

const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      actions: {
        /**
         * 통합된 OAuth 로그인
         * - provider: 'kakao' | 'google' | 'github' 등
         */
        loginWithOAuth: async (provider: Provider) => {
          try {
            set({ isLoading: true, error: null })
            const supabase = createClient()
            const redirectURL = `${window.location.origin}/api/auth/callback`

            await supabase.auth.signInWithOAuth({
              provider,
              options: { redirectTo: redirectURL },
            })
            // 이후는 리다이렉트되므로 상태 업데이트 불필요
          } catch (error) {
            const msg = error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다"
            set({ error: msg, isLoading: false })
          }
        },

        /**
         * 로그아웃
         */
        logout: async () => {
          try {
            set({ isLoading: true, error: null })
            const supabase = createClient()
            await supabase.auth.signOut()
            set({ ...initialState, isLoaded: true })
          } catch (error) {
            const msg = error instanceof Error ? error.message : "로그아웃 중 오류가 발생했습니다"
            set({ error: msg, isLoading: false })
          }
        },

        /**
         * 세션 변경 시 user/profile 동기화
         * - onAuthStateChange 콜백에서 호출
         * - Server Action을 통해 DB 쿼리 실행 (Vault & Gateway 패턴)
         */
        syncUserProfile: async (session: Session | null) => {
          set({ session, isLoading: true })

          if (!session?.user) {
            set({ user: null, profile: null, isLoading: false, isLoaded: true })
            return
          } //로그인은 하지 않았지만 앱은 로드된 상황을 처리하기 위함.

          // Server Action 호출 (DB 쿼리는 서버에서만 실행)
          const { user, profile, error } = await getAuthenticatedUserData()

          set({
            user,
            profile,
            isLoading: false,
            isLoaded: true,
            error,
          })
        },

        /**
         * 초기화 (onAuthStateChange 구독)
         * - LayoutClient에서 마운트 시 호출
         * - 반환값: cleanup 함수 (구독 해제)
         */
        initialize: () => {
          const supabase = createClient()
          const { syncUserProfile } = get().actions //authStore의 actions 중에서 syncUserProfile을 가져오기 위함.

          // 초기 세션 확인
          supabase.auth.getSession().then(({ data: { session } }) => {
            syncUserProfile(session)
          })

          // 세션 변경 구독 (TOKEN_REFRESHED, SIGNED_IN, SIGNED_OUT 등)
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
            syncUserProfile(session) //세션에 변동 사항이 발생한 경우, authStore의 state를 업데이트 하기 위한 onAuthStateChange 세팅
          })

          // cleanup 함수 반환 << 그런데, 여기서 cleanup이 실질적으로 동작하는 경우가 얼마나 될까?
          return () => subscription.unsubscribe()
        },
      },
    }),
    { name: "authStore" },
  ),
)

// ─────────────────────────────────────────────────────────
// 개별 훅 export (외부에서는 이것만 사용)
// ─────────────────────────────────────────────────────────

// State 훅
export const useSession = () => useAuthStore((s) => s.session)
export const useUser = () => useAuthStore((s) => s.user)
export const useProfile = () => useAuthStore((s) => s.profile)
export const useAuthLoaded = () => useAuthStore((s) => s.isLoaded)
export const useAuthLoading = () => useAuthStore((s) => s.isLoading)
export const useAuthError = () => useAuthStore((s) => s.error)

// Actions 훅
export const useAuthActions = () => useAuthStore((s) => s.actions)

// ─────────────────────────────────────────────────────────
// 하위 호환성을 위한 기존 export (점진적 마이그레이션용)
// TODO: 모든 컴포넌트 마이그레이션 후 제거
// ─────────────────────────────────────────────────────────

export { useAuthStore }
