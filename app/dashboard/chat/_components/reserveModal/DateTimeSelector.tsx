"use client"

import React, { memo, useState } from "react"
import DatePicker from "react-datepicker"

import "react-datepicker/dist/react-datepicker.css"
import { ko } from "date-fns/locale"

import { DateTimeSelectorProps } from "./types"

export const DateTimeSelector = memo(function DateTimeSelector({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableTimes,
  selectedGame,
  isLoading,
  handleAddReservation,
}: DateTimeSelectorProps) {
  // 드롭다운 오픈 상태를 로컬로 관리하여 깜빡임 제거
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">예약 일시</span>
      </label>
      {isLoading ? (
        <div className="flex justify-center items-center p-4">
          <div className="loading loading-spinner loading-md text-primary"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date)
                setIsDateOpen(false)
              }}
              dateFormat="yyyy.MM.dd"
              minDate={new Date()}
              placeholderText="예약 날짜 선택"
              locale={ko}
              className="input input-bordered flex-1"
              disabled={isLoading}
              shouldCloseOnSelect
              open={isDateOpen}
              onInputClick={() => !isLoading && setIsDateOpen(true)}
              onClickOutside={() => setIsDateOpen(false)}
              onCalendarClose={() => setIsDateOpen(false)}
              onKeyDown={(e) => {
                // 스페이스로 달력 열기/토글
                if (e.key === " " || e.code === "Space" || e.key === "Spacebar") {
                  e.preventDefault()
                  if (!isLoading) setIsDateOpen((prev) => !prev)
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <DatePicker
              selected={selectedTime}
              onChange={(time) => {
                setSelectedTime(time)
                setIsTimeOpen(false)
              }}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeFormat="HH:mm"
              dateFormat="HH:mm"
              includeTimes={availableTimes}
              placeholderText="시간 선택"
              locale={ko}
              className="input input-bordered flex-1"
              disabled={!selectedDate || isLoading || availableTimes.length === 0}
              shouldCloseOnSelect
              open={isTimeOpen}
              onInputClick={() => !isLoading && setIsTimeOpen(true)}
              onClickOutside={() => setIsTimeOpen(false)}
              onCalendarClose={() => setIsTimeOpen(false)}
              onKeyDown={(e) => {
                // 스페이스로 시간 선택 드롭다운 열기/토글
                if (e.key === " " || e.code === "Space" || e.key === "Spacebar") {
                  e.preventDefault()
                  if (!isLoading && selectedDate && availableTimes.length > 0) {
                    setIsTimeOpen((prev) => !prev)
                  }
                }
              }}
            />
            <button
              className={`btn btn-primary btn-sm ${
                !selectedDate || !selectedTime || !selectedGame || isLoading ? "btn-disabled" : ""
              }`}
              onClick={handleAddReservation}
              disabled={!selectedDate || !selectedTime || !selectedGame || isLoading}
            >
              추가
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
