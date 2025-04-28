// app/dashboard/chat/_hooks/useSendMessage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi, ChatQueryKeys } from '@/app/dashboard/chat/_api'
import { toast } from 'react-hot-toast'

export function useSendMessage(roomId: string, hasRoomId: boolean) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ content, receiverId, chatRoomId }: { 
      content: string, 
      receiverId: string, 
      chatRoomId: string 
    }) => chatApi.sendMessage(content, receiverId, chatRoomId),
    onSuccess: () => {
      if (hasRoomId) {
        queryClient.invalidateQueries({ queryKey: ChatQueryKeys.messages(roomId) })
        queryClient.invalidateQueries({ queryKey: ChatQueryKeys.chatRooms })
      }
    },
    onError: (error) => {
      toast.error('메시지 전송에 실패했습니다.')
      console.error('메시지 전송 오류:', error)
    }
  })

  return mutation
}