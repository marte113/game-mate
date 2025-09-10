"use client"

import React, { memo } from "react"
import dynamic from "next/dynamic"

import { ReservationSummaryProps } from "../types"
import { SummarySectionSkeleton } from "./skeletons/SummarySectionSkeleton"

const ReservationSummary = dynamic(
  () => import("../ReservationSummary").then((m) => ({ default: m.ReservationSummary })),
  { ssr: false, loading: () => <SummarySectionSkeleton /> },
)

export const SummarySection = memo(function SummarySection({
  gameReservationCounts,
  totalTokens,
}: ReservationSummaryProps) {
  return (
    <div className="flex-1">
      <ReservationSummary gameReservationCounts={gameReservationCounts} totalTokens={totalTokens} />
    </div>
  )
})
