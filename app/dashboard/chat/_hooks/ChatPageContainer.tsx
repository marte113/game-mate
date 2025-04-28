'use client'

import { useState } from 'react'

import LeftSection from '../_components/LeftSection'
import RightSection from '../_components/RightSection'
import ChatRoom from '../_components/ChatRoom'

interface OtherUser {
  id: string;
  name: string;
  profile_circle_img: string | null;
  is_online: boolean;
}

interface ChatRoom {
  id: string;
  last_message: string | null;
  last_message_time: string | null;
  participants: {
    id: string;
    chat_room_id: string;
    user_id: string;
    unread_count: number;
  }[];
  otherUser: OtherUser | null;
}

export default function ChatPageContainer() {
  const [searchTerm, setSearchTerm] = useState('')
  
  return (
      <div className="flex  h-[calc(100vh-4rem)] gap-4">
        {/* 왼쪽 섹션: 채팅 리스트 */}
        <LeftSection 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {/* 오른쪽 섹션: 채팅 내용 */}
      <RightSection>
          <ChatRoom />
        </RightSection>
      </div>
  )
} 