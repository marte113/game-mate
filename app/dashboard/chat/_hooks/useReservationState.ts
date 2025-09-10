import { useReducer, useCallback, useMemo } from "react"
import { Game, Reservation } from "../_components/reserveModal/types"

// 통합 상태 타입
interface ReservationState {
  // 날짜/시간 관련
  selectedDate: Date | null
  selectedTime: Date | null
  availableTimes: Date[]

  // 게임/예약 관련
  selectedGame: Game | null
  reservations: Reservation[]

  // UI 상태
  phase: "select" | "payment"
  isSubmitting: boolean
}

// 액션 타입들 - 도메인 중심으로 설계
type ReservationAction =
  | { type: "SET_DATE"; payload: Date | null }
  | { type: "SET_TIME"; payload: Date | null }
  | { type: "UPDATE_AVAILABLE_TIMES"; payload: Date[] }
  | { type: "SELECT_GAME"; payload: Game | null }
  | { type: "ADD_RESERVATION"; payload: Reservation }
  | { type: "REMOVE_RESERVATION"; payload: number }
  | { type: "CLEAR_RESERVATIONS" }
  | { type: "SET_PHASE"; payload: "select" | "payment" }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "RESET_MODAL" }

// 초기 상태
const initialState: ReservationState = {
  selectedDate: new Date(),
  selectedTime: null,
  availableTimes: [],
  selectedGame: null,
  reservations: [],
  phase: "select",
  isSubmitting: false,
}

// Reducer - 불변성과 타입 안전성 보장
function reservationReducer(state: ReservationState, action: ReservationAction): ReservationState {
  switch (action.type) {
    case "SET_DATE":
      return {
        ...state,
        selectedDate: action.payload,
        selectedTime: null, // 날짜 변경 시 시간 초기화
      }

    case "SET_TIME":
      return {
        ...state,
        selectedTime: action.payload,
      }

    case "UPDATE_AVAILABLE_TIMES":
      {
        const prev = state.availableTimes
        const next = action.payload
        const sameLength = prev.length === next.length
        const sameItems = sameLength && prev.every((d, i) => d.getTime() === next[i].getTime())
        if (sameItems) return state
      }
      return {
        ...state,
        availableTimes: action.payload,
      }

    case "SELECT_GAME":
      return {
        ...state,
        selectedGame: action.payload,
      }

    case "ADD_RESERVATION":
      if (state.reservations.length >= 5) {
        return state // 최대 5개 제한
      }
      return {
        ...state,
        reservations: [...state.reservations, action.payload],
        selectedTime: null, // 예약 추가 후 시간 초기화
      }

    case "REMOVE_RESERVATION":
      return {
        ...state,
        reservations: state.reservations.filter((res) => res.id !== action.payload),
      }

    case "CLEAR_RESERVATIONS":
      return {
        ...state,
        reservations: [],
      }

    case "SET_PHASE":
      return {
        ...state,
        phase: action.payload,
      }

    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      }

    case "RESET_MODAL":
      return {
        ...initialState,
        selectedDate: new Date(), // 새 Date 객체로 초기화
      }

    default:
      return state
  }
}

// 커스텀 훅 - 액션 크리에이터와 비즈니스 로직 캡슐화
export function useReservationState() {
  const [state, dispatch] = useReducer(reservationReducer, initialState)

  // 액션 크리에이터들 - useCallback으로 메모이제이션 (개별 함수로 분리)
  const setDate = useCallback((date: Date | null) => {
    dispatch({ type: "SET_DATE", payload: date })
  }, [])

  const setTime = useCallback((time: Date | null) => {
    dispatch({ type: "SET_TIME", payload: time })
  }, [])

  const updateAvailableTimes = useCallback((times: Date[]) => {
    dispatch({ type: "UPDATE_AVAILABLE_TIMES", payload: times })
  }, [])

  const selectGame = useCallback((game: Game | null) => {
    dispatch({ type: "SELECT_GAME", payload: game })
  }, [])

  const addReservation = useCallback((selectedTime: Date, selectedGame: Game) => {
    const reservation: Reservation = {
      id: Date.now(),
      date: selectedTime,
      game: selectedGame,
    }
    dispatch({ type: "ADD_RESERVATION", payload: reservation })
  }, [])

  const removeReservation = useCallback((id: number) => {
    dispatch({ type: "REMOVE_RESERVATION", payload: id })
  }, [])

  const clearReservations = useCallback(() => {
    dispatch({ type: "CLEAR_RESERVATIONS" })
  }, [])

  const setPhase = useCallback((phase: "select" | "payment") => {
    dispatch({ type: "SET_PHASE", payload: phase })
  }, [])

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", payload: isSubmitting })
  }, [])

  const resetModal = useCallback(() => {
    dispatch({ type: "RESET_MODAL" })
  }, [])

  // actions 객체 자체를 안정화 (useMemo)
  const actions = useMemo(
    () => ({
      setDate,
      setTime,
      updateAvailableTimes,
      selectGame,
      addReservation,
      removeReservation,
      clearReservations,
      setPhase,
      setSubmitting,
      resetModal,
    }),
    [
      setDate,
      setTime,
      updateAvailableTimes,
      selectGame,
      addReservation,
      removeReservation,
      clearReservations,
      setPhase,
      setSubmitting,
      resetModal,
    ],
  )

  // 계산된 값들 - useMemo 대신 여기서 계산
  const computed = {
    sortedReservations: [...state.reservations].sort((a, b) => a.date.getTime() - b.date.getTime()),

    gameReservationCounts: state.reservations.reduce(
      (acc, reservation) => {
        if (!reservation.game) return acc

        const gameId = reservation.game.id
        if (!acc[gameId]) {
          acc[gameId] = { count: 0, game: reservation.game }
        }
        acc[gameId].count += 1
        return acc
      },
      {} as Record<string, { count: number; game: Game }>,
    ),

    totalTokens: state.reservations.length * 700,

    canAddReservation: state.selectedTime && state.selectedGame && state.reservations.length < 5,

    canProceedToPayment: state.selectedGame && state.reservations.length > 0,
  }

  return {
    state,
    actions,
    computed,
  }
}
