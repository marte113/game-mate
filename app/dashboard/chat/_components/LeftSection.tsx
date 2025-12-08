"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

import { useMobileView, useChatUiActions } from "@/stores/chatUiStore"
import { cn } from "@/utils/classname"

export default function LeftSection({ children }: { children: ReactNode }) {
  const mobileView = useMobileView()
  const { setSearchTerm } = useChatUiActions()

  // 페이지 입장/이탈 시 검색어만 초기화 (선택된 채팅은 유지)
  useEffect(() => {
    setSearchTerm("")
    return () => setSearchTerm("")
  }, [setSearchTerm])

  return (
    <div
      className={cn(
        "bg-base-100 rounded-lg shadow-xl h-full w-full md:w-80 flex-col",
        mobileView === "room" ? "hidden md:flex" : "flex",
      )}
    >
      {children}
    </div>
  )
}
