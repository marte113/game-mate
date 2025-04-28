import { useEffect, useRef } from "react";
import { useQueryClient , useQuery , useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ChatQueryKeys } from "../_api";
import { chatApi } from "../_api/chatApi";


// 메시지 전송 파라미터 타입 정의
interface SendMessageParams {
  content: string;
  receiverId: string;
}

export function useChatRoom(roomId: string, userId?: string) {
  const queryClient = useQueryClient();
  // 이전 roomId 값을 기억하기 위한 ref
  const prevRoomIdRef = useRef<string>('');
  // 디바운싱을 위한 타이머 ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ChatQueryKeys.messages(roomId),
    queryFn: () => chatApi.getMessages(roomId),
    enabled: !!roomId,
  });

  // 메시지 전송 뮤테이션 - 객체 형태로 파라미터 받기
  const sendMessageMutation = useMutation({
    mutationFn: (params: SendMessageParams) =>
      chatApi.sendMessage(params.content, params.receiverId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ChatQueryKeys.messages(roomId),
      });
      queryClient.invalidateQueries({ queryKey: ChatQueryKeys.chatRooms });
    },
    onError: (error) => {
      toast.error("메시지 전송에 실패했습니다.");
      console.error(error);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: chatApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ChatQueryKeys.chatRooms });
    },
  });

  // 읽음 처리 - 디바운싱 및 이전 채팅방 확인 로직 추가
  useEffect(() => {
    // 채팅방이나 사용자 ID가 없으면 실행하지 않음
    if (!roomId || !userId) return;
    
    // 같은 채팅방에 대해 반복 호출 방지
    if (prevRoomIdRef.current === roomId) return;
    
    // 이전 타이머가 있다면 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // 새 타이머 설정 (500ms 디바운싱)
    timerRef.current = setTimeout(() => {
      markAsReadMutation.mutate(roomId);
      // 현재 roomId를 이전 값으로 저장
      prevRoomIdRef.current = roomId;
    }, 500);
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [roomId, userId]); // markAsReadMutation 의존성 제거

  // 수정된 handleSendMessage 함수 - 객체 형태로 파라미터 전달
  const handleSendMessage = (content: string, receiverId: string) => {
    sendMessageMutation.mutate({ content, receiverId });
  };

  return {
    messages,
    isLoading,
    handleSendMessage,
    isSending: sendMessageMutation.isPending,
  };
}
