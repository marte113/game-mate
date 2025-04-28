"use client";

import { Trash2 } from "lucide-react";
import { ReservationListProps } from "./types";

export function ReservationList({
  reservations,
  formatDate,
  handleRemoveReservation,
  isLoading
}: ReservationListProps) {
  if (reservations.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="flex justify-between items-center p-2 bg-base-200 rounded-lg"
        >
          <div className="w-full flex justify-between items-center px-3">
            <span className="text-sm font-bold">
              {reservation.game.game}
            </span>
            <span className="text-sm">
              {formatDate(reservation.date)}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => handleRemoveReservation(reservation.id)}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 text-error" />
          </button>
        </div>
      ))}
    </div>
  );
} 