// app/dashboard/chat/_components/ChatInput.tsx
"use client"

import { useState, FormEvent, useRef } from "react"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  isSubmitting: boolean
}

export default function ChatInput({ onSendMessage, isSubmitting }: ChatInputProps) {
  const [messageText, setMessageText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    onSendMessage(messageText)
    setMessageText("")
    // 전송 후에도 입력 포커스를 유지하여 연속 입력 UX 개선
    queueMicrotask(() => inputRef.current?.focus())
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="input input-bordered flex-1 h-10"
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          전송
        </button>
      </div>
    </form>
  )
}
