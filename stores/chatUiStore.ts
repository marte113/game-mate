"use client"

import { create } from "zustand"

import type { ChatRoom } from "@/app/dashboard/chat/_types"

type ChatUiState = {
  // 채팅 UI 상태
  searchTerm: string
  selectedChat: ChatRoom | null

  // UI 액션
  setSearchTerm: (q: string) => void
  setSelectedChat: (chat: ChatRoom | null) => void
  reset: () => void
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  // 초기 상태
  searchTerm: "",
  selectedChat: null,

  // 액션
  setSearchTerm: (q) => set({ searchTerm: q }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  reset: () => set({ searchTerm: "", selectedChat: null }),
}))
