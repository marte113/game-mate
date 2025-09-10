"use client"

import React from "react"

export function ReservationListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(1)].map((_, i) => (
        <div key={i} className="h-12 rounded-md bg-base-200 animate-pulse" />
      ))}
    </div>
  )
}
