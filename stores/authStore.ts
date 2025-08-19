import { create } from 'zustand'
import { createClient } from '@/libs/api/supabase'

import {UsersRow, ProfilesRow} from '@/types/database.table.types'

// 프로필 인터페이스 정의
interface Profile {
  id: string
  user_id: string
  username?: string
  nickname?: string
  description?: string
  rating?: number
  follower_count?: number
  youtube_urls?: string[]
  created_at?: string
  updated_at?: string
}

interface AuthState {
  user: UsersRow | null
  profile: ProfilesRow | null
  isLoading: boolean
  error: string | null
  loginWithKakao: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  
  loginWithKakao: async () => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      const redirectURL = window.location.origin + "/api/auth/callback"
      
      await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectURL,
        },
      })
      // 리다이렉션이 발생하므로 여기서는 상태를 업데이트하지 않음
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
    }
  },
  
  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      const redirectURL = window.location.origin + "/api/auth/callback"
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL,
        },
      })
      // 리다이렉션이 발생하므로 여기서는 상태를 업데이트하지 않음
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구글 로그인 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      await supabase.auth.signOut()
      set({ user: null, profile: null, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
    }
  },
  
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null })
      const supabase = createClient()
      const { data: { user }, error: userAuthError } = await supabase.auth.getUser()
      if (userAuthError) {
        set({ error: '인증 정보를 확인하는 중 오류가 발생했습니다', isLoading: false })
        return
      }
      if (user) {
        // 사용자 정보 확인
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (userError) {
          console.error('Error fetching user:', userError)
          // 사용자가 없으면 트리거가 자동으로 생성해야 하지만, 수동으로 처리할 수도 있음
          // 여기서는 트리거에 의존하고 오류만 기록
          set({ error: '사용자 정보를 가져오는 중 오류가 발생했습니다', isLoading: false })
          return
        }
        
        // 프로필 정보 확인
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')  
          .eq('user_id', user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile:', profileError)
          set({ error: '프로필 정보를 가져오는 중 오류가 발생했습니다', isLoading: false })
          return
        }
        
        set({ 
          user: userData, 
          profile: profileData, 
          isLoading: false 
        })
      } else {
        set({ user: null, profile: null, isLoading: false })
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      const errorMessage = error instanceof Error ? error.message : '인증 확인 중 오류가 발생했습니다'
      set({ error: errorMessage, isLoading: false })
    }
  }
})) 