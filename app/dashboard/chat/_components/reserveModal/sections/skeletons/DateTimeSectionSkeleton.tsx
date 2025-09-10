"use client"

import React from "react"

export function DateTimeSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="h-10 rounded-md bg-base-200 animate-pulse flex-1" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 rounded-md bg-base-200 animate-pulse flex-1" />
        <button className="btn btn-primary btn-sm" disabled>
          추가
        </button>
      </div>
      <div className="mt-2 space-y-2">
        <div className="h-12 rounded-md bg-base-200 animate-pulse" />
        <div className="h-12 rounded-md bg-base-200 animate-pulse" />
        <div className="h-12 rounded-md bg-base-200 animate-pulse" />
      </div>
    </div>
  )
}
