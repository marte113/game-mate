"use client"

import { create } from 'zustand'

type ChatUiState = {
  searchTerm: string
  setSearchTerm: (q: string) => void
  reset: () => void
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  searchTerm: '',
  setSearchTerm: (q) => set({ searchTerm: q }),
  reset: () => set({ searchTerm: '' }),
}))
