"use client"

import { create } from "zustand"
import { combine, devtools } from "zustand/middleware"

import type { ChatRoom } from "@/app/dashboard/chat/_types"

// ─────────────────────────────────────────────────────────────
// 상태 타입 정의
// ─────────────────────────────────────────────────────────────

type MobileView = "list" | "room"

type ChatUiState = {
  /** 채팅방 검색어 */
  searchTerm: string
  /** 현재 선택된 채팅방 */
  selectedChat: ChatRoom | null
  /** 모바일 뷰 상태: 768px 미만에서는 list(목록) 또는 room(대화창) 중 하나만 노출 */
  mobileView: MobileView
}

// ─────────────────────────────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────────────────────────────

const initState: ChatUiState = {
  searchTerm: "",
  selectedChat: null,
  mobileView: "list",
}

// ─────────────────────────────────────────────────────────────
// 스토어 생성
// ─────────────────────────────────────────────────────────────

export const useChatUiStore = create(
  devtools(
    combine(initState, (set) => ({
      actions: {
        /** 검색어 설정 */
        setSearchTerm: (q: string) => set({ searchTerm: q }),

        /** 선택된 채팅방 설정 */
        setSelectedChat: (chat: ChatRoom | null) => set({ selectedChat: chat }),

        /** 모바일 뷰 상태 설정 */
        setMobileView: (view: MobileView) => set({ mobileView: view }),

        /** 상태 초기화 */
        reset: () => set(initState),
      },
    })),
    { name: "chatUiStore" },
  ),
)

// ─────────────────────────────────────────────────────────────
// 상태 셀렉터 훅
// ─────────────────────────────────────────────────────────────

/** 검색어 상태 */
export const useSearchTerm = () => useChatUiStore((s) => s.searchTerm)

/** 선택된 채팅방 상태 */
export const useSelectedChat = () => useChatUiStore((s) => s.selectedChat)

/** 모바일 뷰 상태 */
export const useMobileView = () => useChatUiStore((s) => s.mobileView)

// ─────────────────────────────────────────────────────────────
// 액션 훅
// ─────────────────────────────────────────────────────────────

/** 채팅 UI 액션들 */
export const useChatUiActions = () => useChatUiStore((s) => s.actions)
