"use client"

import { create } from "zustand"

// 레거시 지원을 위한 최소 상태만 유지
interface ChatState {
  // 레거시 호환성을 위한 상태 (더 이상 사용하지 않음)
  isLoading: boolean
  error: string | null
}

// 레거시 chatStore - 더 이상 사용하지 않음
// 모든 채팅 관련 기능은 React Query 훅과 chatUiStore로 이전됨
export const useChatStore = create<ChatState>(() => ({
  // 레거시 호환성을 위해 최소 상태만 유지
  isLoading: false,
  error: null,
}))
