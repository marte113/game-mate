"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"
import { useSelectedChat } from "@/stores/chatUiStore"

import ChatRoom from "./ChatRoom"
import EmptyRoom from "./EmptyRoom"

export default function ChatRoomBoundary() {
  const selectedChat = useSelectedChat()
  const roomId = selectedChat?.id ?? ""

  if (!roomId) {
    // 채팅방이 선택되지 않은 경우에는 바운더리 없이 기본 UI 노출
    return <EmptyRoom />
  }

  return (
    <QuerySectionBoundary keys={queryKeys.chat.messages(roomId)}>
      <ChatRoom />
    </QuerySectionBoundary>
  )
}
