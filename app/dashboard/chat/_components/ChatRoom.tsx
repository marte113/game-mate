"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"

import { useAuthStore } from "@/stores/authStore"
import { useChatUiStore } from "@/stores/chatUiStore"
import { useNotificationStore } from "@/stores/notificationStore"
import { useChatMessages } from "@/hooks/api/chat/useChatQueries"
import { useSendMessage, useMarkAsRead } from "@/hooks/api/chat/useChatMutations"

import ReservationModal from "./reserveModal/ReservationModal"
import ChatHeader from "./ChatHeader"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"

export default function ChatRoom() {
  const [isReservationOpen, setIsReservationOpen] = useState(false)

  // 전역 상태에서 사용자 ID만 가져오기 - 최적화
  const userId = useAuthStore((state) => state.user?.id)

  // UI 스토어에서 선택된 채팅방 가져오기
  const { selectedChat } = useChatUiStore()

  // 현재 채팅방 ID - 참조 안정성 확보
  console.log("ChatRoom / selectedChat", selectedChat)
  const roomId = useMemo(() => selectedChat?.id || "", [selectedChat?.id])

  // 새로운 React Query 훅들 사용
  const { data: messages = [], isLoading } = useChatMessages(roomId)
  const sendMessageMutation = useSendMessage()
  const { mutate: markAsRead } = useMarkAsRead()

  // 알림 스토어는 필요한 액션만 셀렉터로 구독하여 불필요 리렌더 방지
  const markChatNotificationsAsRead = useNotificationStore((s) => s.markChatNotificationsAsRead)

  // 동일 채팅방 중복 읽음 처리 방지용 ref
  const lastMarkedRoomIdRef = useRef<string | null>(null)

  // 채팅방 입장 시 알림 읽음 처리
  useEffect(() => {
    if (!selectedChat?.id || !userId) return

    // 같은 채팅방에 대해 중복 호출 방지 (StrictMode 이중 호출 포함)
    if (lastMarkedRoomIdRef.current === selectedChat.id) return
    lastMarkedRoomIdRef.current = selectedChat.id

    console.log("selectedChat?.id 통과")
    // 알림 읽음 처리 (에러는 내부에서 처리)
    void markChatNotificationsAsRead(selectedChat.id)

    // 채팅방 읽음 처리 (뮤테이션 상태 변경으로 인한 재실행 방지를 위해 의존성에서 제외)
    markAsRead(selectedChat.id)

    // 디버깅 로그 추가
    console.log("읽음 처리 시도:", selectedChat.id)
    console.log("접속한 유저 ID", userId)
  }, [selectedChat?.id, userId, markChatNotificationsAsRead, markAsRead])

  // 메시지 전송 핸들러 - 참조 안정성 확보
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedChat?.otherUser?.id || !roomId) {
        toast.error("채팅 상대를 찾을 수 없습니다.")
        return
      }

      sendMessageMutation.mutate({
        content,
        receiverId: selectedChat.otherUser.id,
        chatRoomId: roomId || undefined,
      })
    },
    [selectedChat?.otherUser?.id, roomId, sendMessageMutation],
  )

  // 예약 버튼 클릭 핸들러 - 참조 안정성 확보
  const handleReservationClick = useCallback(() => {
    setIsReservationOpen(true)
  }, [])

  // 모달 닫기 핸들러 - 참조 안정성 확보
  const handleCloseModal = useCallback(() => {
    setIsReservationOpen(false)
  }, [])

  // 채팅방이 선택되지 않은 경우 안내 화면
  if (!selectedChat || !selectedChat.otherUser) {
    return (
      <div className="flex-1 bg-base-100 rounded-lg shadow-xl h-full w-full ">
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">채팅방을 선택해 주세요</h2>
            <p className="text-base-content/60">
              왼쪽 목록에서 대화할 상대를 선택하거나, 새로운 대화를 시작하세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full flex flex-col w-full">
        {/* 채팅방 헤더 */}
        <ChatHeader
          otherUser={selectedChat.otherUser}
          onReservationClick={handleReservationClick}
        />

        {/* 메시지 목록 */}
        <MessageList messages={messages} isLoading={isLoading} currentUserId={userId} />

        {/* 메시지 입력 */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isDisabled={isLoading || sendMessageMutation.isPending}
        />
      </div>

      {/* 예약 모달 */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={handleCloseModal}
        userId={selectedChat.otherUser?.id}
      />
    </>
  )
}
