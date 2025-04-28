// app/dashboard/chat/_components/ChatInput.tsx
'use client'

import { useState, FormEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  isDisabled: boolean
}

export default function ChatInput({ onSendMessage, isDisabled }: ChatInputProps) {
  const [messageText, setMessageText] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    onSendMessage(messageText)
    setMessageText('')
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="input input-bordered flex-1 h-10"
          disabled={isDisabled}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isDisabled}
        >
          전송
        </button>
      </div>
    </form>
  )
}