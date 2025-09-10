"use client"

import { useMemo, useEffect, useCallback, useState, useRef } from "react"
import "react-datepicker/dist/react-datepicker.css"
import { X } from "lucide-react"
import { isAfter, parse } from "date-fns"
import { createPortal } from "react-dom"

import { useGamesByTitles } from "@/hooks/api/games/useGamesByTitles"
import { useSelectedGamesByUserId } from "@/hooks/api/profile/useSelectedGamesByUserId"
import { useProviderReservationsQuery } from "@/hooks/api/orders/useOrdersQueries"
import { useCreateOrdersBatchMutation } from "@/hooks/api/orders/useCreateOrdersBatchMutation"

import { useReservationState } from "../../_hooks/useReservationState"
import { type ReservationModalProps } from "./types"

import type { Order as ProviderOrder } from "@/app/dashboard/task/_types/orderTypes"
import { formatDate } from "./utils"
import { DateTimeSection } from "./sections/DateTimeSection"
import { GameSection } from "./sections/GameSection"
import { SummarySection } from "./sections/SummarySection"
import { PaymentSection } from "./sections/PaymentSection"

// 섹션 단위 컴포넌트 사용으로 리렌더 범위 최소화

export default function ReservationModal({ isOpen, onClose, userId }: ReservationModalProps) {
  // ✨ 단일 커스텀 훅으로 모든 상태 관리
  const { state, actions, computed } = useReservationState()
  // actions에서 개별 함수만 구조 분해 (의존성 최소화)
  const {
    setDate,
    setTime,
    updateAvailableTimes,
    selectGame,
    addReservation,
    removeReservation,
    setPhase,
    resetModal,
  } = actions

  // 모달 라이프사이클 사이드 이펙트 (리셋, 스크롤락+ESC, 포커스 트랩, 마운트 게이트)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)
  useEffect(() => setMounted(true), [])

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      resetModal()
    }
  }, [isOpen, resetModal])

  // ESC 닫기 + 바디 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, onClose])

  // 포커스 트랩: 모달 열릴 때 내부로 포커스 이동, Tab 순환, 닫힐 때 이전 포커스 복원
  useEffect(() => {
    if (!isOpen) return
    const container = modalRef.current
    if (!container) return

    previousActiveRef.current = (document.activeElement as HTMLElement) ?? null

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    const getFocusables = () =>
      Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]

    const focusables = getFocusables()
    ;(focusables[0] ?? container).focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const els = getFocusables()
      if (els.length === 0) return
      const current = (document.activeElement as HTMLElement) ?? null
      const idx = current ? els.indexOf(current) : -1
      e.preventDefault()
      if (e.shiftKey) {
        const prevIdx = idx <= 0 ? els.length - 1 : idx - 1
        els[prevIdx]?.focus()
      } else {
        const nextIdx = idx === els.length - 1 ? 0 : idx + 1
        els[nextIdx]?.focus()
      }
    }

    container.addEventListener("keydown", onKeyDown)

    return () => {
      container.removeEventListener("keydown", onKeyDown)
      // 이전 포커스로 복원
      previousActiveRef.current?.focus?.()
    }
  }, [isOpen])

  // 제공자의 selected_games 조회 - 훅스 레이어 사용
  const { data: selectedGamesResp, isLoading: isLoadingSelectedGames } = useSelectedGamesByUserId(
    userId,
    { enabled: !!userId && isOpen },
  )

  const titles = (selectedGamesResp?.selectedGames ?? []).map((t) => t.trim()).filter(Boolean)
  const { data: titlesData, isLoading: isLoadingTitles } = useGamesByTitles(titles, {
    enabled: isOpen && titles.length > 0,
  })

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
  } = useProviderReservationsQuery(userId, {
    enabled: !!userId && isOpen,
    staleTime: 1000 * 60 * 5,
  })

  // 결제 처리 뮤테이션 - 훅스 레이어 사용(배치 생성)
  const createOrdersBatchMutation = useCreateOrdersBatchMutation({
    onSuccess: () => {
      alert("결제가 완료되었습니다. 예약이 확정되었습니다.")
      resetModal()
      onClose()
    },
    onError: (error) => {
      console.error("결제 처리 오류:", error)
      alert(
        `결제 처리 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`,
      )
    },
  })

  // 기존 예약 시간을 Date 객체의 배열로 변환 (기존과 동일)
  const existingReservations = useMemo(() => {
    if (!existingReservationsData?.orders) return []
    return existingReservationsData.orders.map((o: ProviderOrder) =>
      // 서버가 로컬 시각으로 내려준다고 가정하고 명시 포맷으로 파싱
      parse(`${o.scheduled_date} ${o.scheduled_time}`, "yyyy-MM-dd HH:mm:ss", new Date()),
    )
  }, [existingReservationsData])

  // 예약 시간 O(1) 조회를 위한 키셋
  const toKey = useCallback((d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const hh = String(d.getHours()).padStart(2, "0")
    const mi = String(d.getMinutes()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
  }, [])

  const reservedSet = useMemo(() => {
    const s = new Set<string>()
    existingReservations.forEach((d) => s.add(toKey(d)))
    state.reservations.forEach((r) => s.add(toKey(r.date)))
    return s
  }, [existingReservations, state.reservations, toKey])

  // 불필요한 수동 refetch 제거: enabled 플래그로 자동 관리됨

  // 신청 가능 시간 체크 로직 - Set 기반으로 O(1) 조회
  const isTimeAvailable = useCallback(
    (time: Date) => {
      const now = new Date()
      if (!isAfter(time, now)) return false
      return !reservedSet.has(toKey(time))
    },
    [reservedSet, toKey],
  )

  // ✨ 가용 시간 생성 로직
  const SLOTS_PER_DAY = 48
  const getAvailableTimes = useCallback(
    (date: Date) => {
      if (!date) return []

      const times = []
      const startTime = new Date(date)
      startTime.setHours(0, 0, 0, 0)

      for (let i = 0; i < SLOTS_PER_DAY; i++) {
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
      updateAvailableTimes(times)
    } else {
      updateAvailableTimes([])
    }
  }, [state.selectedDate, getAvailableTimes, updateAvailableTimes])

  // ✨ 간소화된 이벤트 핸들러들
  const handleAddReservation = useCallback(() => {
    if (!state.selectedTime || !state.selectedGame) return
    if (!isTimeAvailable(state.selectedTime)) {
      alert("이미 예약된 시간이거나 선택할 수 없는 시간입니다.")
      return
    }

    if (state.reservations.length >= 5) {
      alert("한 번에 최대 5개까지만 예약할 수 있습니다.")
      return
    }

    addReservation(state.selectedTime, state.selectedGame)
  }, [
    state.selectedTime,
    state.selectedGame,
    state.reservations.length,
    addReservation,
    isTimeAvailable,
  ])

  const handleSubmit = useCallback(() => {
    if (!computed.canProceedToPayment) return
    setPhase("payment")
  }, [computed.canProceedToPayment, setPhase])

  const handleBack = useCallback(() => {
    setPhase("select")
  }, [setPhase])

  const handlePayment = useCallback(() => {
    if (!computed.canProceedToPayment || !userId) return
    const payloads = state.reservations.map((reservation) => ({
      providerId: userId,
      game: reservation.game.game,
      scheduledDate: reservation.date.toISOString().split("T")[0],
      scheduledTime: reservation.date.toTimeString().split(" ")[0],
      price: 700,
    }))
    createOrdersBatchMutation.mutate(payloads)
  }, [computed.canProceedToPayment, state.reservations, userId, createOrdersBatchMutation])

  //  로딩 상태 계산 단순화
  const isLoading = useMemo(
    () =>
      isLoadingReservations ||
      createOrdersBatchMutation.isPending ||
      isLoadingSelectedGames ||
      isLoadingTitles,
    [
      isLoadingReservations,
      createOrdersBatchMutation.isPending,
      isLoadingSelectedGames,
      isLoadingTitles,
    ],
  )

  const hasError = useMemo(() => Boolean(reservationError), [reservationError])
  const isPaymentDisabled = useMemo(
    () => !computed.canProceedToPayment || isLoading,
    [computed.canProceedToPayment, isLoading],
  )

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-base-100 rounded-lg w-full max-w-lg p-6 relative"
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 btn btn-ghost btn-circle btn-sm"
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
            <DateTimeSection
              selectedDate={state.selectedDate}
              setSelectedDate={setDate}
              selectedTime={state.selectedTime}
              setSelectedTime={setTime}
              availableTimes={state.availableTimes}
              selectedGame={state.selectedGame}
              isLoading={isLoading}
              handleAddReservation={handleAddReservation}
              reservations={computed.sortedReservations}
              formatDate={formatDate}
              handleRemoveReservation={removeReservation}
            />

            <GameSection
              games={mappedProviderGames}
              selectedGame={state.selectedGame}
              setSelectedGame={selectGame}
              isLoading={isLoading}
            />

            <div className="flex justify-between gap-2 mt-8">
              <SummarySection
                gameReservationCounts={Object.values(computed.gameReservationCounts)}
                totalTokens={computed.totalTokens}
              />

              <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
                  취소
                </button>
                <button
                  className="btn btn-primary"
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
          <PaymentSection
            gameReservationCounts={Object.values(computed.gameReservationCounts)}
            reservations={state.reservations}
            formatDate={formatDate}
            totalTokens={computed.totalTokens}
            onBack={handleBack}
            onPay={handlePayment}
            isPaying={createOrdersBatchMutation.isPending}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}
