"use client"

import React from "react"

export function PaymentInfoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-base-200 rounded-lg animate-pulse">
        <div className="h-5 w-24 bg-base-300 rounded mb-3" />
        <div className="space-y-3">
          {[...Array(1)].map((_, i) => (
            <div key={i} className="h-16 bg-base-300 rounded" />
          ))}
        </div>
      </div>

      <div className="p-4 bg-base-200 rounded-lg animate-pulse">
        <div className="h-5 w-24 bg-base-300 rounded mb-3" />
        <div className="h-8 bg-base-300 rounded" />
      </div>
    </div>
  )
}
