// app/dashboard/chat/_api/index.ts

// chatApi.ts 파일의 모든 내용을 다시 내보냅니다
export * from './chatApi'

// React Query 관련 상수와 훅 정의
export const ChatQueryKeys = {
  chatRooms: ['chatRooms'] as const,
  messages: (roomId: string) => ['messages', roomId] as const,
}

// 추가 유틸리티나 함수가 필요하면 여기에 정의할 수 있습니다
