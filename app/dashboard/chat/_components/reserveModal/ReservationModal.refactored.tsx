"use client"

import { useMemo, useEffect, useCallback } from "react"
import "react-datepicker/dist/react-datepicker.css"
import { useQuery, useMutation } from "@tanstack/react-query"
import { X } from "lucide-react"
import { isSameDay, isAfter, isSameHour, isSameMinute } from "date-fns"
import dynamic from "next/dynamic"

import { orderApi } from "@/app/dashboard/_api/orderApi"
import { useReservationState } from "../../_hooks/useReservationState"
import { ReservationModalProps, ReservationOrder, ProviderOrdersResponse } from "./types"
import { useGamesByTitles } from "@/hooks/api/games/useGamesByTitles"
import { queryKeys } from "@/constants/queryKeys"
import { fetchJson } from "@/libs/api/fetchJson"
import { formatDate } from "./utils"

// 동적 컴포넌트 로딩 (기존과 동일)
const DateTimeSelector = dynamic(
  () => import("./DateTimeSelector").then((mod) => ({ default: mod.DateTimeSelector })),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center p-4">
        <div className="loading loading-spinner loading-md text-primary"></div>
      </div>
    ),
  },
)
const ReservationList = dynamic(
  () => import("./ReservationList").then((mod) => ({ default: mod.ReservationList })),
  { ssr: false },
)
const GameSelector = dynamic(
  () => import("./GameSelector").then((mod) => ({ default: mod.GameSelector })),
  { ssr: false },
)
const ReservationSummary = dynamic(
  () => import("./ReservationSummary").then((mod) => ({ default: mod.ReservationSummary })),
  { ssr: false },
)
const PaymentInfo = dynamic(
  () => import("./PaymentInfo").then((mod) => ({ default: mod.PaymentInfo })),
  { ssr: false },
)

export default function ReservationModal({ isOpen, onClose, userId }: ReservationModalProps) {
  // ✨ 단일 커스텀 훅으로 모든 상태 관리
  const { state, actions, computed } = useReservationState()

  // 제공자의 selected_games 조회 (기존과 동일)
  const { data: selectedGamesResp, isLoading: isLoadingSelectedGames } = useQuery<{
    selectedGames: string[]
  }>({
    queryKey: userId
      ? queryKeys.profile.selectedGamesByUserId(userId)
      : (["profile", "selectedGames", "unknown"] as const),
    queryFn: async () =>
      fetchJson<{ selectedGames: string[] }>(
        `/api/profile/selected-games?userId=${encodeURIComponent(userId!)}`,
      ),
    enabled: !!userId && isOpen,
    staleTime: 10 * 60 * 1000,
  })

  const titles = (selectedGamesResp?.selectedGames ?? []).map((t) => t.trim()).filter(Boolean)
  const { data: titlesData, isLoading: isLoadingTitles } = useGamesByTitles(titles)

  // GameSelector가 기대하는 Game 타입으로 매핑 (기존과 동일)
  const mappedProviderGames = useMemo(
    () =>
      (titlesData?.games ?? []).map((g) => ({
        id: g.id,
        game: g.description ?? g.name,
        image: g.image_url ?? "https://placehold.co/640x360?text=Game",
      })),
    [titlesData?.games],
  )

  // 기존 예약 정보 가져오기 (기존과 동일)
  const {
    data: existingReservationsData,
    isLoading: isLoadingReservations,
    error: reservationError,
    refetch: refetchReservations,
  } = useQuery<ProviderOrdersResponse>({
    queryKey: ["providerReservations", userId],
    queryFn: async () => {
      if (!userId) return { orders: [] }
      const response = await orderApi.getProviderReservations(userId)
      return response as unknown as ProviderOrdersResponse
    },
    enabled: !!userId && isOpen,
    staleTime: 1000 * 60 * 5,
  })

  // 기존 예약 시간을 Date 객체의 배열로 변환 (기존과 동일)
  const existingReservations = useMemo(() => {
    if (!existingReservationsData?.orders) return []
    return existingReservationsData.orders.map((order: ReservationOrder) => {
      return new Date(`${order.scheduled_date}T${order.scheduled_time}`)
    })
  }, [existingReservationsData])

  // 모달이 열릴 때마다 예약 정보 새로고침
  useEffect(() => {
    if (isOpen && userId) {
      refetchReservations()
    }
  }, [isOpen, userId, refetchReservations])

  // ✨ 시간 가용성 체크 로직 - 메모이제이션으로 최적화
  const isTimeAvailable = useCallback(
    (time: Date) => {
      const currentTime = new Date()

      // 1. 현재 시간 이전인지 확인
      if (!isAfter(time, currentTime)) return false

      // 2. 이미 사용자가 추가한 예약 시간과 겹치는지 확인
      const isReservedByUser = state.reservations.some(
        (res) =>
          isSameDay(time, res.date) && isSameHour(time, res.date) && isSameMinute(time, res.date),
      )

      // 3. 기존 예약 시간과 겹치는지 확인
      const isAlreadyReserved = existingReservations.some(
        (reservedTime: Date) =>
          isSameDay(time, reservedTime) &&
          isSameHour(time, reservedTime) &&
          isSameMinute(time, reservedTime),
      )

      return !isReservedByUser && !isAlreadyReserved
    },
    [state.reservations, existingReservations],
  )

  // ✨ 가용 시간 생성 로직
  const getAvailableTimes = useCallback(
    (date: Date) => {
      if (!date) return []

      const times = []
      const startTime = new Date(date)
      startTime.setHours(0, 0, 0, 0)

      for (let i = 0; i < 48; i++) {
        const time = new Date(startTime.getTime() + i * 30 * 60 * 1000)
        if (isTimeAvailable(time)) {
          times.push(time)
        }
      }
      return times
    },
    [isTimeAvailable],
  )

  // 날짜가 변경될 때 사용 가능한 시간 업데이트
  useEffect(() => {
    if (state.selectedDate) {
      const dateOnly = new Date(state.selectedDate)
      dateOnly.setHours(0, 0, 0, 0)
      const times = getAvailableTimes(dateOnly)
      actions.updateAvailableTimes(times)
    } else {
      actions.updateAvailableTimes([])
    }
  }, [state.selectedDate, getAvailableTimes, actions])

  // ✨ 간소화된 이벤트 핸들러들
  const handleAddReservation = useCallback(() => {
    if (!state.selectedTime || !state.selectedGame) return

    if (state.reservations.length >= 5) {
      alert("한 번에 최대 5개까지만 예약할 수 있습니다.")
      return
    }

    actions.addReservation(state.selectedTime, state.selectedGame)
  }, [state.selectedTime, state.selectedGame, state.reservations.length, actions])

  const handleSubmit = useCallback(() => {
    if (!computed.canProceedToPayment) return
    actions.setPhase("payment")
  }, [computed.canProceedToPayment, actions])

  const handleBack = useCallback(() => {
    actions.setPhase("select")
  }, [actions])

  // ✨ 결제 처리 뮤테이션 - 상태 관리 단순화
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const createOrderPromises = state.reservations.map(async (reservation) => {
        const orderData = {
          providerId: userId || "",
          game: reservation.game.game,
          scheduledDate: reservation.date.toISOString().split("T")[0],
          scheduledTime: reservation.date.toTimeString().split(" ")[0],
          price: 700,
        }
        return await orderApi.createOrder(orderData)
      })
      return await Promise.all(createOrderPromises)
    },
    onMutate: () => {
      actions.setSubmitting(true)
    },
    onSuccess: () => {
      alert("결제가 완료되었습니다. 예약이 확정되었습니다.")
      actions.resetModal()
      onClose()
      refetchReservations()
    },
    onError: (error) => {
      console.error("결제 처리 오류:", error)
      alert(
        `결제 처리 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`,
      )
    },
    onSettled: () => {
      actions.setSubmitting(false)
    },
  })

  const handlePayment = useCallback(() => {
    if (!computed.canProceedToPayment) return
    createOrderMutation.mutate()
  }, [computed.canProceedToPayment, createOrderMutation])

  // ✨ 로딩 상태 계산 단순화
  const isLoading = useMemo(
    () =>
      isLoadingReservations ||
      createOrderMutation.isPending ||
      state.isSubmitting ||
      isLoadingSelectedGames ||
      isLoadingTitles,
    [
      isLoadingReservations,
      createOrderMutation.isPending,
      state.isSubmitting,
      isLoadingSelectedGames,
      isLoadingTitles,
    ],
  )

  const hasError = useMemo(() => reservationError !== null, [reservationError])
  const isPaymentDisabled = useMemo(
    () => !computed.canProceedToPayment || isLoading,
    [computed.canProceedToPayment, isLoading],
  )

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      actions.resetModal()
    }
  }, [isOpen, actions])

  if (!isOpen) return null

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
          {state.phase === "select" ? "예약하기" : "결제하기"}
        </h3>

        {hasError && (
          <div className="alert alert-error mb-4">
            <p>예약 정보를 불러오는데 실패했습니다. 다시 시도해주세요.</p>
          </div>
        )}

        {state.phase === "select" ? (
          <div className="space-y-6">
            {/* 날짜 및 시간 선택 영역 */}
            <DateTimeSelector
              selectedDate={state.selectedDate}
              setSelectedDate={actions.setDate}
              selectedTime={state.selectedTime}
              setSelectedTime={actions.setTime}
              availableTimes={state.availableTimes}
              selectedGame={state.selectedGame}
              isLoading={isLoading}
              handleAddReservation={handleAddReservation}
            />

            {/* 예약 목록 */}
            <div className="mt-4">
              <h3 className="font-bold mb-2">예약 목록 ({state.reservations.length}/5)</h3>
              <ReservationList
                reservations={computed.sortedReservations}
                formatDate={formatDate}
                handleRemoveReservation={actions.removeReservation}
                isLoading={isLoading}
              />
            </div>

            {/* 게임 선택 영역 */}
            <GameSelector
              games={mappedProviderGames}
              selectedGame={state.selectedGame}
              setSelectedGame={actions.selectGame}
              isLoading={isLoading}
            />

            <div className="flex justify-between gap-2 mt-8">
              {/* 예약 요약 정보 */}
              <ReservationSummary
                gameReservationCounts={Object.values(computed.gameReservationCounts)}
                totalTokens={computed.totalTokens}
              />

              <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
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
              gameReservationCounts={Object.values(computed.gameReservationCounts)}
              reservations={state.reservations}
              formatDate={formatDate}
              totalTokens={computed.totalTokens}
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
  )
}
