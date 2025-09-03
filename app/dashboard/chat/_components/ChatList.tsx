"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { createClient } from "@/supabase/functions/client"
import { useChatStore } from "@/stores/chatStore"
import { useChatUiStore } from "@/stores/chatUiStore"
import { chatApi } from "@/app/dashboard/chat/_api"
import type { ChatRoom } from "@/app/dashboard/chat/_types"
import { useMessageSubscription } from "@/app/dashboard/chat/_hooks/useMessageSubscription"
import { queryKeys } from "@/constants/queryKeys"
import { formatMessageTime } from "../_utils/formatters"

// 로딩 중 스켈레톤 UI 컴포넌트
function ChatSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="skeleton w-12 h-12 rounded-full"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-32 mb-2"></div>
              <div className="skeleton h-3 w-full"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// 채팅방 목록 컴포넌트
export default function ChatList() {
  // useChatStore에서 필요한 상태만 가져오기 (UI 상태만)
  const { selectedChat, setSelectedChat } = useChatStore()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  // 전역 검색어 사용 (Zustand)
  const globalSearchTerm = useChatUiStore((s) => s.searchTerm)

  // React Query로 채팅방 목록 가져오기 (코어 훅 사용)
  const { data: chatRooms, isLoading } = useQuery({
    queryKey: queryKeys.chat.chatRooms(),
    queryFn: chatApi.getChatRooms,
  })

  // 현재 선택된 채팅방 ID (실시간 구독에 사용)
  const currentChatRoomId = selectedChat?.id || null

  // 실시간 메시지 구독 훅 사용
  useMessageSubscription(currentChatRoomId)

  // 파생된 필터링 목록은 useMemo로 계산
  const filteredChatRooms = useMemo<ChatRoom[]>(() => {
    if (!chatRooms) return []
    const q = (globalSearchTerm || "").trim().toLowerCase()
    if (!q) return chatRooms
    return chatRooms.filter((room) => {
      const otherUserName = room.otherUser?.name?.toLowerCase() || ""
      const lastMessage = room.last_message?.toLowerCase() || ""
      return otherUserName.includes(q) || lastMessage.includes(q)
    })
  }, [chatRooms, globalSearchTerm])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setCurrentUserId(data.user.id)
      }
    }

    fetchCurrentUser()
  }, [])

  const handleSelectChat = (chatRoom: ChatRoom) => {
    setSelectedChat(chatRoom)
  }

  const renderChatRooms = () => {
    if (filteredChatRooms.length === 0) {
      return (
        <div className="py-8 text-center text-base-content/60">
          <p>채팅방이 없습니다</p>
        </div>
      )
    }

    return (
      <>
        {filteredChatRooms.map((chatRoom) => (
          <button
            key={chatRoom.id}
            className={`w-full p-4 text-left hover:bg-base-200 border-b ${
              selectedChat?.id === chatRoom.id ? "bg-base-200" : ""
            }`}
            onClick={() => handleSelectChat(chatRoom)}
          >
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-12 rounded-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      chatRoom.otherUser?.profile_circle_img ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatRoom.otherUser?.name || "Unknown"}`
                    }
                    alt="avatar"
                  />
                  {chatRoom.otherUser?.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-base-100"></span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{chatRoom.otherUser?.name || "알 수 없는 사용자"}</h3>
                  <span className="text-xs text-base-content/60">
                    {formatMessageTime(chatRoom.last_message_time)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-base-content/70 truncate">
                    {chatRoom.last_message || "새로운 대화를 시작하세요"}
                  </p>
                  {chatRoom.participants.some(
                    (p) =>
                      p.user_id === currentUserId && p.unread_count !== null && p.unread_count > 0,
                  ) && (
                    <span className="badge badge-primary badge-sm ml-2">
                      {
                        chatRoom.participants.find(
                          (p) => p.user_id === currentUserId && p.unread_count !== null,
                        )?.unread_count
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      {isLoading ? <ChatSkeleton /> : renderChatRooms()}
    </div>
  )
}
