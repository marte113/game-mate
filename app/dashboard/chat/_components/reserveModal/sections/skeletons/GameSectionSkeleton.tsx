"use client"

import React from "react"

export function GameSectionSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-28 bg-base-200 rounded-md animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-base-200 rounded-md animate-pulse" />
        ))}
      </div>
    </div>
  )
}
