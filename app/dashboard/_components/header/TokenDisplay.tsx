"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import Image from "next/image"

import { useTokenBalanceQuery } from "@/hooks/api/token/useTokenBalanceQuery"
import { useUser } from "@/stores/authStore"

// API 호출은 커스텀 훅으로 위임

// 메모이제이션을 통한 불필요한 리렌더링 방지
export default function TokenDisplay() {
  const user = useUser()
  const router = useRouter()

  const { data: tokenBalance = 0, isLoading } = useTokenBalanceQuery(user?.id)

  const handleTokenClick = useCallback(() => {
    const params = new URLSearchParams()
    params.set("tab", "token")
    router.push(`dashboard?${params.toString()}`)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-6 items-center gap-2 px-3 bg-base-200 rounded-md">
        <span className="loading loading-spinner loading-xs"></span>
      </div>
    )
  }

  return (
    <div className="flex h-6 items-center gap-2 px-3 bg-base-200 rounded-md">
      <Image
        src="/images/tokken.png"
        alt="coin"
        width={20}
        height={20}
        className="w-5 h-5"
        priority // LCP 최적화
      />
      <span className="text-sm font-semibold">{tokenBalance}</span>
      <button
        onClick={handleTokenClick}
        className="bg-purple-500 rounded-full w-[18px] h-[18px] flex items-center justify-center text-white hover:bg-purple-400 transition-colors duration-200"
      >
        <Plus className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </div>
  )
}
