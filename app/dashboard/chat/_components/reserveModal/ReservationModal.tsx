"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { orderApi } from "@/app/dashboard/_api/orderApi";
import {
  isSameDay,
  isAfter,
  isSameHour,
  isSameMinute,
} from "date-fns";
import { useMutation } from "@tanstack/react-query";
import dynamic from 'next/dynamic';

// 타입과 컴포넌트 가져오기
import { 
  ReservationModalProps, 
  ReservationOrder, 
  ProviderOrdersResponse, 
  Reservation,
  Game
} from "./types";
import { games } from "./data";
import { formatDate } from "./utils";

// 동적 로딩 적용
const DateTimeSelector = dynamic(() => import('./DateTimeSelector').then(mod => ({ default: mod.DateTimeSelector })), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <div className="loading loading-spinner loading-md text-primary"></div>
    </div>
  ) 
});
const ReservationList = dynamic(() => import('./ReservationList').then(mod => ({ default: mod.ReservationList })), { ssr: false });
const GameSelector = dynamic(() => import('./GameSelector').then(mod => ({ default: mod.GameSelector })), { ssr: false });
const ReservationSummary = dynamic(() => import('./ReservationSummary').then(mod => ({ default: mod.ReservationSummary })), { ssr: false });
const PaymentInfo = dynamic(() => import('./PaymentInfo').then(mod => ({ default: mod.PaymentInfo })), { ssr: false });

export default function ReservationModal({
  isOpen,
  onClose,
  userId,
}: ReservationModalProps) {
  // 날짜와 시간 상태 분리
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<Date[]>([]);
  
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [phase, setPhase] = useState<"select" | "payment">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tanstack Query를 사용하여 기존 예약 정보 가져오기
  const {
    data: existingReservationsData,
    isLoading: isLoadingReservations,
    error: reservationError,
    refetch: refetchReservations,
  } = useQuery<ProviderOrdersResponse>({
    queryKey: ["providerReservations", userId],
    queryFn: async () => {
      if (!userId) return { orders: [] };
      const response = await orderApi.getProviderReservations(userId);
      return response as unknown as ProviderOrdersResponse;
    },
    enabled: !!userId && isOpen, // userId가 있고 모달이 열렸을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });

  // 기존 예약 시간을 Date 객체의 배열로 변환
  const existingReservations = useMemo(() => {
    if (!existingReservationsData?.orders) return [];

    return existingReservationsData.orders.map((order: ReservationOrder) => {
      return new Date(`${order.scheduled_date}T${order.scheduled_time}`);
    });
  }, [existingReservationsData]);

  // 모달이 열릴 때마다 예약 정보 새로고침
  useEffect(() => {
    if (isOpen && userId) {
      refetchReservations();
    }
  }, [isOpen, userId, refetchReservations]);

  // 정렬된 예약 목록
  const sortedReservations = useMemo(() => {
    return [...reservations].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [reservations]);

  // 게임별 예약 횟수를 계산하는 함수
  const gameReservationCounts = useMemo(() => {
    const countMap: Record<string, { count: number; game: any }> = {};

    reservations.forEach((reservation) => {
      if (!reservation.game) return;

      const gameId = reservation.game.id;
      if (!countMap[gameId]) {
        countMap[gameId] = {
          count: 0,
          game: reservation.game,
        };
      }
      countMap[gameId].count += 1;
    });

    return Object.values(countMap);
  }, [reservations]);

  // 게임별 토큰 계산
  const totalTokens = useMemo(() => {
    return reservations.length * 700;
  }, [reservations]);

  // 특정 시간이 예약 가능한지 확인하는 함수
  const isTimeAvailable = useCallback(
    (time: Date) => {
      const currentTime = new Date();

      // 1. 현재 시간 이전인지 확인
      if (!isAfter(time, currentTime)) {
        return false;
      }

      // 2. 이미 사용자가 추가한 예약 시간과 겹치는지 확인
      const isReservedByUser = reservations.some(
        (res) =>
          isSameDay(time, res.date) &&
          isSameHour(time, res.date) &&
          isSameMinute(time, res.date)
      );

      // 3. 기존 예약 시간과 겹치는지 확인
      const isAlreadyReserved = existingReservations.some(
        (reservedTime: Date) =>
          isSameDay(time, reservedTime) &&
          isSameHour(time, reservedTime) &&
          isSameMinute(time, reservedTime)
      );

      return !isReservedByUser && !isAlreadyReserved;
    },
    [reservations, existingReservations]
  );

  // 시간 간격 생성 (30분 간격)
  const getAvailableTimes = useCallback(
    (date: Date) => {
      if (!date) return [];

      const times = [];
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);

      for (let i = 0; i < 48; i++) {
        // 30분 간격으로 48개 시간 (24시간)
        const time = new Date(startTime.getTime() + i * 30 * 60 * 1000);
        if (isTimeAvailable(time)) {
          times.push(time);
        }
      }

      return times;
    },
    [isTimeAvailable]
  );

  // 날짜가 변경될 때 사용 가능한 시간 업데이트
  useEffect(() => {
    if (selectedDate) {
      const dateOnly = new Date(selectedDate);
      dateOnly.setHours(0, 0, 0, 0);
      const times = getAvailableTimes(dateOnly);
      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, getAvailableTimes]);

  // 예약 추가 - 시간과 게임이 있어야 가능 (useCallback 추가)
  const handleAddReservation = useCallback(() => {
    if (!selectedTime || !selectedGame) return;

    // 예약에 추가할 전체 일시 생성 (선택된 날짜 + 선택된 시간)
    const reservationDateTime = new Date(selectedTime);
    
    setReservations((prev) => {
      if (prev.length >= 5) {
        alert("한 번에 최대 5개까지만 예약할 수 있습니다.");
        return prev;
      }

      const newReservations = [
        ...prev,
        {
          id: Date.now(),
          date: reservationDateTime,
          game: selectedGame,
        },
      ];
      return newReservations;
    });
    
    // 시간만 초기화하고 날짜는 유지
    setSelectedTime(null);
  }, [selectedTime, selectedGame]);

  // 예약 제거 (useCallback 추가)
  const handleRemoveReservation = useCallback((id: number) => {
    setReservations(prev => prev.filter((res) => res.id !== id));
  }, []);

  // 결제 단계로 이동 (useCallback 추가)
  const handleSubmit = useCallback(() => {
    if (!selectedGame || reservations.length === 0) return;
    // 선택 단계에서 결제 단계로 이동
    setPhase("payment");
  }, [selectedGame, reservations.length]);

  // 결제 단계에서 이전 단계로 돌아가기 (useCallback 추가)
  const handleBack = useCallback(() => {
    setPhase("select");
  }, []);

  // 결제 처리에 useMutation 사용
  const createOrderMutation = useMutation<
    any, // 성공 응답 타입
    Error, // 에러 타입
    void, // 인자 타입
    unknown // 컨텍스트 타입
  >({
    mutationFn: async () => {
      // 각 예약에 대해 의뢰 생성 요청
      const createOrderPromises = reservations.map(async (reservation) => {
        const orderData = {
          providerId: userId || "",
          game: reservation.game.game,
          scheduledDate: reservation.date.toISOString().split("T")[0], // YYYY-MM-DD 형식
          scheduledTime: reservation.date.toTimeString().split(" ")[0], // HH:MM:SS 형식
          price: 700, // 게임당 고정 가격
        };

        // orderApi를 통해 의뢰 생성
        return await orderApi.createOrder(orderData);
      });

      // 모든 의뢰 생성 요청 처리 대기
      return await Promise.all(createOrderPromises);
    },
    onSuccess: () => {
      alert("결제가 완료되었습니다. 예약이 확정되었습니다.");

      // 상태 초기화 및 모달 닫기
      setPhase("select");
      setReservations([]);
      setSelectedGame(null);
      onClose();

      // 예약 정보 새로고침
      refetchReservations();
    },
    onError: (error) => {
      console.error("결제 처리 오류:", error);
      alert(
        `결제 처리 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    },
  });

  // 최종 결제 처리 (useCallback 추가)
  const handlePayment = useCallback(() => {
    if (!selectedGame || reservations.length === 0) return;
    createOrderMutation.mutate();
  }, [selectedGame, reservations.length, createOrderMutation]);

  // 로딩 상태 및 버튼 disabled 조건 최적화 (useMemo 추가)
  const isLoading = useMemo(() => 
    isLoadingReservations || createOrderMutation.isPending || isSubmitting,
    [isLoadingReservations, createOrderMutation.isPending, isSubmitting]
  );

  const hasError = useMemo(() => reservationError !== null, [reservationError]);
  
  // 결제 버튼 비활성화 조건 메모이제이션
  const isPaymentDisabled = useMemo(() => 
    !selectedGame || reservations.length === 0 || isLoading,
    [selectedGame, reservations.length, isLoading]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 btn btn-ghost btn-circle btn-sm"
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-bold mb-6">
          {phase === "select" ? "예약하기" : "결제하기"}
        </h3>

        {hasError && (
          <div className="alert alert-error mb-4">
            <p>예약 정보를 불러오는데 실패했습니다. 다시 시도해주세요.</p>
          </div>
        )}

        {phase === "select" ? (
          <div className="space-y-6">
            {/* 날짜 및 시간 선택 영역 */}
            <DateTimeSelector
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              availableTimes={availableTimes}
              selectedGame={selectedGame}
              isLoading={isLoading}
              handleAddReservation={handleAddReservation}
            />

            {/* 예약 목록 */}
            <div className="mt-4">
              <h3 className="font-bold mb-2">
                예약 목록 ({reservations.length}/5)
              </h3>
              <ReservationList
                reservations={sortedReservations}
                formatDate={formatDate}
                handleRemoveReservation={handleRemoveReservation}
                isLoading={isLoading}
              />
            </div>

            {/* 게임 선택 영역 */}
            <GameSelector
              games={games}
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              isLoading={isLoading}
            />

            <div className="flex justify-between gap-2 mt-8">
              {/* 예약 요약 정보 */}
              <ReservationSummary
                gameReservationCounts={gameReservationCounts}
                totalTokens={totalTokens}
              />
              
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  className={`btn btn-primary ${isPaymentDisabled ? "btn-disabled" : ""}`}
                  onClick={handleSubmit}
                  disabled={isPaymentDisabled}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "결제하기"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 결제 페이즈 UI */
          <div className="space-y-6">
            <PaymentInfo
              gameReservationCounts={gameReservationCounts}
              reservations={reservations}
              formatDate={formatDate}
              totalTokens={totalTokens}
            />
            
            <div className="flex justify-between gap-4 mt-6">
              <button
                className="btn btn-outline flex-1"
                onClick={handleBack}
                disabled={createOrderMutation.isPending}
              >
                이전
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handlePayment}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "결제 완료"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
