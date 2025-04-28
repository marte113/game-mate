// app/dashboard/chat/_components/MessageList.tsx
'use client'

import { useRef, useEffect } from 'react'

import { Message } from '@/app/dashboard/chat/_types'

import MessageItem from './MessageItem'

interface MessageListProps {
  messages?: Message[]
  isLoading: boolean
  currentUserId: string | undefined
}

export default function MessageList({ messages, isLoading, currentUserId }: MessageListProps) {
  // 스크롤 컨테이너를 위한 Ref 추가
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 스크롤 컨테이너 Ref를 사용하여 스크롤 위치 조절
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // 부드러운 스크롤 대신 즉시 이동으로 변경 (선택 사항)
      // container.scrollTop = container.scrollHeight;
      // 또는 requestAnimationFrame 사용 시도
      requestAnimationFrame(() => {
         container.scrollTop = container.scrollHeight;
      });
    }
    // messages 배열이 변경될 때마다 실행
  }, [messages]);

  const isCurrentUserMessage = (senderId: string) => {
    if (!currentUserId) return false
    return senderId === currentUserId
  }

  if (isLoading) {
    return (
      // 로딩 상태에서도 컨테이너 구조 유지
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-center items-center h-full">
          <div className="loading loading-spinner loading-md"></div>
        </div>
      </div>
    )
  }

  return (
    // 스크롤 컨테이너에 새로운 Ref 연결
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages?.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isCurrentUser={isCurrentUserMessage(message.sender_id)}
        />
      ))}
      {/* messagesEndRef를 위한 빈 div는 이제 필요 없음 */}
    </div>
  )
}

 