"use client"

import React, { memo } from "react"
import dynamic from "next/dynamic"

import { PaymentInfoProps } from "../types"
import { PaymentInfoSkeleton } from "./skeletons/PaymentInfoSkeleton"

const PaymentInfo = dynamic(
  () => import("../PaymentInfo").then((m) => ({ default: m.PaymentInfo })),
  { ssr: false, loading: () => <PaymentInfoSkeleton /> },
)

export interface PaymentSectionProps extends PaymentInfoProps {
  onBack: () => void
  onPay: () => void
  isPaying: boolean
}

export const PaymentSection = memo(function PaymentSection({
  gameReservationCounts,
  reservations,
  formatDate,
  totalTokens,
  onBack,
  onPay,
  isPaying,
}: PaymentSectionProps) {
  return (
    <div className="space-y-6">
      <PaymentInfo
        gameReservationCounts={gameReservationCounts}
        reservations={reservations}
        formatDate={formatDate}
        totalTokens={totalTokens}
      />

      <div className="flex justify-between gap-4 mt-6">
        <button className="btn btn-outline flex-1" onClick={onBack} disabled={isPaying}>
          이전
        </button>
        <button className="btn btn-primary flex-1" onClick={onPay} disabled={isPaying}>
          {isPaying ? <span className="loading loading-spinner loading-sm"></span> : "결제 완료"}
        </button>
      </div>
    </div>
  )
})
