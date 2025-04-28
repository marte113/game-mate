// app/dashboard/chat/_components/ChatHeader.tsx
'use client'

import { getAvatarUrl } from '../_utils/avatar'

interface ChatHeaderProps {
  otherUser: {
    id: string
    name: string | null
    profile_circle_img: string | null
    is_online: boolean | null
  }
  onReservationClick: () => void
}

export default function ChatHeader({ otherUser, onReservationClick }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center gap-3">
      <div className="avatar">
        <div className="w-12 rounded-full">
          <img src={getAvatarUrl(otherUser)} alt="avatar" />
        </div>
      </div>
      <div className="flex-1">
        <h2 className="font-bold">{otherUser?.name || '알 수 없는 사용자'}</h2>
        <div className="flex items-center gap-2">
          {otherUser?.is_online ? (
            <span className="text-sm text-green-500">● 온라인</span>
          ) : (
            <span className="text-sm text-gray-500">● 오프라인</span>
          )}
          <div className="flex items-center gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={onReservationClick}
            >
              예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}