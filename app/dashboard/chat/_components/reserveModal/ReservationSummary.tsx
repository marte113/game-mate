"use client";

import Image from "next/image";

import { ReservationSummaryProps } from "./types";

export function ReservationSummary({
  gameReservationCounts,
  totalTokens
}: ReservationSummaryProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {gameReservationCounts.length > 0 ? (
          gameReservationCounts.map((item) => (
            <div
              key={item.game.id}
              className="flex items-center gap-2 text-sm"
            >
              <div className="w-6 h-6 relative rounded-sm overflow-hidden">
                <Image
                  src={item.game.image}
                  alt={item.game.game}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-medium">{item.game.game}</span>
              <span className="text-primary font-bold">
                x {item.count}
              </span>
            </div>
          ))
        ) : (
          <span className="text-sm">게임을 선택해주세요</span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Image
          src="/images/tokken.png"
          alt="token"
          width={16}
          height={16}
          className="w-4 h-4"
        />
        <span className="font-bold text-primary">
          {totalTokens}개
        </span>
      </div>
    </div>
  );
} 