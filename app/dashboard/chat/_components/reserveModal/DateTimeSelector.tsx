"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import { DateTimeSelectorProps } from "./types";

export function DateTimeSelector({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableTimes,
  selectedGame,
  isLoading,
  handleAddReservation
}: DateTimeSelectorProps) {
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
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy.MM.dd"
              minDate={new Date()}
              placeholderText="예약 날짜 선택"
              locale={ko}
              className="input input-bordered flex-1"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <DatePicker
              selected={selectedTime}
              onChange={(time) => setSelectedTime(time)}
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
            />
            <button
              className={`btn btn-primary btn-sm ${
                !selectedDate || !selectedTime || !selectedGame || isLoading
                  ? "btn-disabled"
                  : ""
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
  );
} 