"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

import { useMobileView, useChatUiActions } from "@/stores/chatUiStore"
import { cn } from "@/utils/classname"

export default function LeftSection({ children }: { children: ReactNode }) {
  const mobileView = useMobileView()
  const { setSearchTerm, setSelectedChat } = useChatUiActions()

  // 페이지 이탈 시 검색어 및 선택된 채팅방 초기화
  // (selectedChat이 남아있으면 다른 페이지에서도 알림이 자동 읽음 처리됨)
  useEffect(() => {
    setSearchTerm("")
    return () => {
      setSearchTerm("")
      setSelectedChat(null)
    }
  }, [setSearchTerm, setSelectedChat])

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
