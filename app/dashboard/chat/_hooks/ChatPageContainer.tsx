import { type ReactNode } from "react"

interface OtherUser {
  id: string
  name: string
  profile_circle_img: string | null
  is_online: boolean
}

interface ChatRoom {
  id: string
  last_message: string | null
  last_message_time: string | null
  participants: {
    id: string
    chat_room_id: string
    user_id: string
    unread_count: number
  }[]
  otherUser: OtherUser | null
}

export default function ChatPageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] gap-2 md:gap-4">{children}</div>
  )
}
