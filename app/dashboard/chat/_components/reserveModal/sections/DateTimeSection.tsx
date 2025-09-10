"use client"

import React, { memo } from "react"
import dynamic from "next/dynamic"

import { DateTimeSelectorProps, ReservationListProps, Reservation } from "../types"
import { DateTimeSelectorSkeleton } from "./skeletons/DateTimeSelectorSkeleton"
import { ReservationListSkeleton } from "./skeletons/ReservationListSkeleton"

const DateTimeSelector = dynamic(
  () => import("../DateTimeSelector").then((m) => ({ default: m.DateTimeSelector })),
  {
    ssr: false,
    loading: () => <DateTimeSelectorSkeleton />,
  },
)
const ReservationList = dynamic(
  () => import("../ReservationList").then((m) => ({ default: m.ReservationList })),
  {
    ssr: false,
    loading: () => <ReservationListSkeleton />,
  },
)

export interface DateTimeSectionProps
  extends Omit<DateTimeSelectorProps, never>,
    Pick<ReservationListProps, "formatDate" | "handleRemoveReservation" | "isLoading"> {
  reservations: Reservation[]
}

export const DateTimeSection = memo(function DateTimeSection({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableTimes,
  selectedGame,
  isLoading,
  handleAddReservation,
  reservations,
  formatDate,
  handleRemoveReservation,
}: DateTimeSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <DateTimeSelectorSkeleton />
        <div className="mt-2">
          <h3 className="font-bold mb-2">예약 목록 (0/5)</h3>
          <ReservationListSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 날짜/시간 선택 */}
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
      <div className="mt-2">
        <h3 className="font-bold mb-2">예약 목록 ({reservations.length}/5)</h3>
        <ReservationList
          reservations={reservations}
          formatDate={formatDate}
          handleRemoveReservation={handleRemoveReservation}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
})
