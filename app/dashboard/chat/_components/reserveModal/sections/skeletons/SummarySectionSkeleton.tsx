"use client"

import React from "react"

export function SummarySectionSkeleton() {
  return (
    <div className="flex-1 p-4 bg-base-200 rounded-lg animate-pulse">
      <div className="h-5 w-40 bg-base-300 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-base-300 rounded" />
      </div>
    </div>
  )
}
