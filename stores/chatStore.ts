'use client'

import { create } from 'zustand'
import { ChatState } from '@/app/dashboard/chat/_types'

export const useChatStore = create<ChatState>((set) => ({
  chatRooms: [],
  currentChatRoom: null,
  selectedChat: null,
  messages: [],
  
  setChatRooms: (chatRooms) => set({ chatRooms }),
  setMessages: (messages) => set({ messages }),
  setCurrentChatRoom: (roomId) => set({ currentChatRoom: roomId }),
  setSelectedChat: (chat) => set({ selectedChat: chat })
}))