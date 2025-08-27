"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { chatApi } from '@/app/dashboard/chat/_api/chatApi'

export function useStartChat() {
  const router = useRouter()
  const { user: loggedInUser } = useAuthStore()
  const { findOrCreateChatWithUser, isLoading: chatLoading, setSelectedChat } = useChatStore()

  const startChatWithUser = async (targetUserId: string | null | undefined) => {
    if (!loggedInUser) {
      toast.error('먼저 로그인이 필요합니다')
      router.push('/login')
      return
    }
    if (!targetUserId) {
      toast.error('상대방 정보를 찾을 수 없습니다.')
      return
    }

    try {
      toast.loading('채팅방으로 이동 중...')
      const chatRoomId = await findOrCreateChatWithUser(targetUserId)
      toast.dismiss()
      if (!chatRoomId) {
        toast.error('채팅방을 생성하는 데 문제가 발생했습니다')
        return
      }

      const chatRoom = await chatApi.getChatRoom(chatRoomId)
      if (!chatRoom) {
        toast.error('채팅방 정보를 가져오는데 실패했습니다.')
        return
      }

      setSelectedChat(chatRoom)
      router.push('/dashboard/chat')
    } catch (err: unknown) {
      console.error('채팅 시작 오류:', err)
      toast.dismiss()
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      toast.error(`채팅을 시작하는 데 문제가 발생했습니다: ${message}`)
    }
  }

  return { startChatWithUser, chatLoading }
}


