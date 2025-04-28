// app/dashboard/chat/_hooks/useMessages.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useEffect } from 'react'

import { chatApi, ChatQueryKeys } from '@/app/dashboard/chat/_api'
import { Message } from '@/app/dashboard/chat/_types'

type MessagesQueryResult = UseQueryResult<Message[], Error>

export function useMessages(roomId: string, hasRoomId: boolean): MessagesQueryResult {
  const queryResult = useQuery<Message[], Error>({
    queryKey: ChatQueryKeys.messages(roomId),
    queryFn: () => hasRoomId ? chatApi.getMessages(roomId) : Promise.resolve([]),
    enabled: hasRoomId
  })
  
  // useEffect 안에서 에러 처리
  useEffect(() => {
    if (queryResult.error) {
      toast.error('메시지를 불러오는데 실패했습니다.')
      console.error('메시지 조회 오류:', queryResult.error)
    }
  }, [queryResult.error]) // 에러가 변경될 때만 실행
  
  return queryResult
}