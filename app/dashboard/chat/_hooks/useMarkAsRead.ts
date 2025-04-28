// app/dashboard/chat/_hooks/useMarkAsRead.ts
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { chatApi, ChatQueryKeys } from '@/app/dashboard/chat/_api'

export function useMarkMessagesAsRead(roomId?: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (roomId) {
      chatApi.markAsRead(roomId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ChatQueryKeys.chatRooms })
        })
        .catch(error => {
          console.error('읽음 처리 오류:', error)
        })
    }
  }, [roomId, queryClient])
}