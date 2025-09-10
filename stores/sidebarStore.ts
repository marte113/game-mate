"use client"

import { create } from "zustand"

// 사이드바 열림/닫힘 상태 전역 관리
// - 루트 레이아웃은 서버 컴포넌트 유지
// - Header/Sidebar 등 클라이언트 컴포넌트에서 공용 사용

type SidebarState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
}))
