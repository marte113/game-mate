"use client";

import Image from "next/image";

import { PaymentInfoProps } from "./types";

export function PaymentInfo({
  gameReservationCounts,
  reservations,
  formatDate,
  totalTokens
}: PaymentInfoProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-base-200 rounded-lg">
        <h4 className="font-bold mb-3">예약 정보</h4>
        <div className="space-y-3">
          {gameReservationCounts.map((item) => (
            <div
              key={item.game.id}
              className="bg-base-100 rounded-md p-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="relative w-12 h-12 rounded-md overflow-hidden border border-base-300">
                  <Image
                    src={item.game.image}
                    alt={item.game.game}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h5 className="font-bold">{item.game.game}</h5>
                  <p className="text-xs text-base-content/70">
                    {item.count}회 예약
                  </p>
                </div>
              </div>

              <div className="space-y-1 mt-2 pt-1 border-primary border-t border-base-300">
                {reservations
                  .filter((res) => res.game.id === item.game.id)
                  .map((res) => (
                    <p key={res.id} className="text-sm">
                      {formatDate(res.date)}
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-base-200 rounded-lg">
        <h4 className="font-bold mb-3">결제 정보</h4>
        <div className="flex items-center justify-between py-2">
          <span>예약 게임</span>
          <span className="font-medium">{reservations.length}건</span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-base-300">
          <span>토큰 총액</span>
          <div className="flex items-center gap-2">
            <Image
              src="/images/tokken.png"
              alt="token"
              width={16}
              height={16}
              className="w-5 h-5"
            />
            <span className="font-bold text-primary text-lg">
              {totalTokens}개
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 