// app/dashboard/chat/_components/MessageItem.tsx
'use client'

import { formatMessageTime } from '../_utils/formatters'
import { Message } from '@/app/dashboard/chat/_types'

interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
}

export default function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  return (
    <div className={`chat ${isCurrentUser ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-bubble ${
          isCurrentUser
            ? 'bg-yellow-300 text-black'
            : 'bg-gray-100 text-black'
        }`}
      >
        {message.content}
        <div className="text-xs opacity-70 text-right mt-1">
          {formatMessageTime(message.created_at)}
        </div>
      </div>
    </div>
  )
}