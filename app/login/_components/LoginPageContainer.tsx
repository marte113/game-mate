"use client"

import { useEffect, useState } from "react"
import type { MouseEventHandler } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

import HeaderCenter from "@/components/layout/HeaderCenter"
import ButtonKakaoLogin from "@/components/auth/ButtonKakaoLogin"
import ButtonGoogleLogin from "@/components/auth/ButtonGoogleLogin"
import { useAuthStore } from "@/stores/authStore"

interface Props {
  // 서버에서 안전하게 파싱된 내부 경로
  nextParam?: string
}

export default function LoginPageContainer({ nextParam }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { loginWithKakao, loginWithGoogle, user, checkAuth } = useAuthStore()
  const router = useRouter()

  // 이미 로그인한 경우: next가 있으면 next로, 없으면 대시보드로
  useEffect(() => {
    checkAuth().then(() => {
      if (user) {
        router.push(nextParam ?? "/dashboard")
      }
    })
  }, [user, nextParam, router, checkAuth])

  const handleKakaoLogin: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    setIsLoading(true)
    void loginWithKakao(nextParam).catch((error) => {
      console.error(error)
      toast.error("로그인 중 오류가 발생했습니다.")
      setIsLoading(false)
    })
  }

  const handleGoogleLogin: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    setIsGoogleLoading(true)
    void loginWithGoogle(nextParam).catch((error) => {
      console.error(error)
      toast.error("구글 로그인 중 오류가 발생했습니다.")
      setIsGoogleLoading(false)
    })
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
