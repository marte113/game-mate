import { create } from "zustand"
import { createClient } from "@/supabase/functions/client"
import type { Database } from "@/types/database.types"

type UserMinimal = Pick<Database["public"]["Tables"]["users"]["Row"], "id" | "profile_circle_img">
type ProfileMinimal = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "nickname" | "rating"
>

interface AuthState {
  user: UserMinimal | null
  profile: ProfileMinimal | null
  isLoading: boolean
  error: string | null
  loginWithKakao: (next?: string) => Promise<void>
  loginWithGoogle: (next?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  loginWithKakao: async (next?: string) => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      const origin = window.location.origin
      // next는 쿠키로 전달 (redirectTo에는 동적 쿼리를 붙이지 않음)
      if (typeof window !== "undefined") {
        if (next) {
          document.cookie = `return_to=${encodeURIComponent(next)}; Path=/; Max-Age=600; SameSite=Lax`
        } else {
          document.cookie = `return_to=; Path=/; Max-Age=0; SameSite=Lax`
        }
      }
      const redirectURL = `${origin}/api/auth/callback`

      await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: redirectURL },
      })
      // 이후는 리다이렉트되므로 상태 업데이트 불필요
    } catch (error) {
      const msg = error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다"
      set({ error: msg, isLoading: false })
    }
  },

  loginWithGoogle: async (next?: string) => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      const origin = window.location.origin
      // next는 쿠키로 전달 (redirectTo에는 동적 쿼리를 붙이지 않음)
      if (typeof window !== "undefined") {
        if (next) {
          document.cookie = `return_to=${encodeURIComponent(next)}; Path=/; Max-Age=600; SameSite=Lax`
        } else {
          document.cookie = `return_to=; Path=/; Max-Age=0; SameSite=Lax`
        }
      }
      const redirectURL = `${origin}/api/auth/callback`

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectURL },
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "구글 로그인 중 오류가 발생했습니다"
      set({ error: msg, isLoading: false })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      await supabase.auth.signOut()
      set({ user: null, profile: null, isLoading: false })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "로그아웃 중 오류가 발생했습니다"
      set({ error: msg, isLoading: false })
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      const {
        data: { user },
        error: userAuthError,
      } = await supabase.auth.getUser()
      if (userAuthError) {
        set({ error: "인증 정보를 확인하는 중 오류가 발생했습니다", isLoading: false })
        return
      }
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, profile_circle_img")
          .eq("id", user.id)
          .single()

        if (userError) {
          console.error("Error fetching user:", userError)
          set({ error: "사용자 정보를 가져오는 중 오류가 발생했습니다", isLoading: false })
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, nickname, rating")
          .eq("user_id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          set({ error: "프로필 정보를 가져오는 중 오류가 발생했습니다", isLoading: false })
          return
        }

        set({
          user: userData as UserMinimal,
          profile: profileData as ProfileMinimal,
          isLoading: false,
        })
      } else {
        set({ user: null, profile: null, isLoading: false })
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      const msg = error instanceof Error ? error.message : "인증 확인 중 오류가 발생했습니다"
      set({ error: msg, isLoading: false })
    }
  },
}))
