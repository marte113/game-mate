"use client"

import { createContext, useContext } from "react"

import type { MateCardData } from "../_types/categoryPage.types"

type MatesValue = Readonly<{ mates: ReadonlyArray<MateCardData> }>
type PaginationValue = {
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

const MatesCtx = createContext<MatesValue | null>(null)
const PaginationCtx = createContext<PaginationValue | null>(null)

export function MatesProvider({
  value,
  pagination,
  children,
}: {
  value: MatesValue
  pagination: PaginationValue
  children: React.ReactNode
}) {
  return (
    <MatesCtx.Provider value={value}>
      <PaginationCtx.Provider value={pagination}>{children}</PaginationCtx.Provider>
    </MatesCtx.Provider>
  )
}

export function useMates() {
  const v = useContext(MatesCtx)
  if (!v) throw new Error("useMates must be used within MatesProvider")
  return v
}

export function usePagination() {
  const v = useContext(PaginationCtx)
  if (!v) throw new Error("usePagination must be used within MatesProvider")
  return v
}
