"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

import { useAuthStore } from "@/stores/authStore"
import { useChatUiStore } from "@/stores/chatUiStore"
import { useCreateChatRoom } from "@/hooks/api/chat/useChatMutations"
import { chatApi } from "@/app/dashboard/chat/_api/chatApi"

export function useStartChat() {
  const router = useRouter()
  const { user: loggedInUser } = useAuthStore()
  const { setSelectedChat } = useChatUiStore()

  // 새로운 React Query 훅들 사용
  const createChatRoomMutation = useCreateChatRoom()

  const startChatWithUser = async (targetUserId: string | null | undefined) => {
    if (!loggedInUser) {
      toast.error("먼저 로그인이 필요합니다")
      router.push("/login")
      return
    }
    if (!targetUserId) {
      toast.error("상대방 정보를 찾을 수 없습니다.")
      return
    }

    try {
      toast.loading("채팅방으로 이동 중...")

      // 채팅방 생성/찾기 (새로운 뮤테이션 사용)
      const chatRoomId = await createChatRoomMutation.mutateAsync({ userId: targetUserId })

      if (!chatRoomId) {
        toast.dismiss()
        toast.error("채팅방을 생성하는 데 문제가 발생했습니다")
        return
      }

      // 채팅방 상세 조회 후 UI 상태 업데이트
      const chatRoom = await chatApi.getChatRoom(chatRoomId)
      setSelectedChat(chatRoom)
      router.push("/dashboard/chat")
      toast.dismiss()
    } catch (err: unknown) {
      console.error("채팅 시작 오류:", err)
      toast.dismiss()
      const message = err instanceof Error ? err.message : "알 수 없는 오류"
      toast.error(`채팅을 시작하는 데 문제가 발생했습니다: ${message}`)
    }
  }

  return {
    startChatWithUser,
    chatLoading: createChatRoomMutation.isPending,
  }
}
