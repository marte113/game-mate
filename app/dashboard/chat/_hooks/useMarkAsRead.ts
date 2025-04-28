// app/dashboard/chat/_hooks/useMarkAsRead.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi, ChatQueryKeys } from '@/app/dashboard/chat/_api'
import { useEffect, useRef } from 'react'

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