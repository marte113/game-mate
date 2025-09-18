"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useRouter, useSearchParams } from "next/navigation"

import HeaderCenter from "@/components/layout/HeaderCenter"
import ButtonKakaoLogin from "@/components/auth/ButtonKakaoLogin"
import ButtonGoogleLogin from "@/components/auth/ButtonGoogleLogin"
import { useAuthStore } from "@/stores/authStore"

// Supabase 회원가입 및 로그인 페이지
export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { loginWithKakao, loginWithGoogle, user, checkAuth } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get("next") ?? undefined

  // 이미 로그인한 경우: next가 있으면 next로, 없으면 대시보드로 리다이렉트
  useEffect(() => {
    checkAuth().then(() => {
      if (user) {
        if (nextParam) {
          router.push(nextParam)
        } else {
          router.push("/dashboard")
        }
      }
    })
  }, [user, router, checkAuth])

  const handleKakaoLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await loginWithKakao(nextParam)
      // 리다이렉션이 발생하므로 여기서는 추가 작업 불필요
    } catch (error) {
      console.error(error)
      toast.error("로그인 중 오류가 발생했습니다.")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsGoogleLoading(true)
    try {
      await loginWithGoogle(nextParam)
      // 리다이렉션이 발생하므로 여기서는 추가 작업 불필요
    } catch (error) {
      console.error(error)
      toast.error("구글 로그인 중 오류가 발생했습니다.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-base-200">
      <div className="w-full max-w-md space-y-8 bg-base-100 p-8 rounded-xl shadow-md">
        <HeaderCenter
          content=""
          title="로그인"
          subtitle="회원 가입을 통해 게임 메이트를 찾아보세요!"
        />

        <div className="mt-8 space-y-4">
          <ButtonKakaoLogin
            isLoading={isLoading}
            onClick={handleKakaoLogin}
            disabled={isLoading || isGoogleLoading}
          />
          <ButtonGoogleLogin
            isLoading={isGoogleLoading}
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          />
        </div>
      </div>
    </main>
  )
}
