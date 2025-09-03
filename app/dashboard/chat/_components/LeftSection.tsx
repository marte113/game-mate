"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

import { useChatUiStore } from "@/stores/chatUiStore"

export default function LeftSection({ children }: { children: ReactNode }) {
  const reset = useChatUiStore((s) => s.reset)

  // 페이지 입장/이탈 시 검색어 초기화
  useEffect(() => {
    reset()
    return () => reset()
  }, [reset])

  return <div className="w-80 bg-base-100 rounded-lg shadow-xl flex flex-col">{children}</div>
}
