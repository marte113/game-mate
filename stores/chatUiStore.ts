"use client"

import { create } from "zustand"

import type { ChatRoom } from "@/app/dashboard/chat/_types"

type ChatUiState = {
  // 채팅 UI 상태
  searchTerm: string
  selectedChat: ChatRoom | null
  // 모바일 뷰 상태: 768px 미만에서는 list(목록) 또는 room(대화창) 중 하나만 노출
  mobileView: "list" | "room"

  // UI 액션
  setSearchTerm: (q: string) => void
  setSelectedChat: (chat: ChatRoom | null) => void
  setMobileView: (view: "list" | "room") => void
  reset: () => void
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  // 초기 상태
  searchTerm: "",
  selectedChat: null,
  mobileView: "list",

  // 액션
  setSearchTerm: (q) => set({ searchTerm: q }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setMobileView: (view) => set({ mobileView: view }),
  reset: () => set({ searchTerm: "", selectedChat: null, mobileView: "list" }),
}))
