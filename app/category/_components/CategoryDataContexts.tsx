'use client'

// 카테고리 페이지 전용 컨텍스트 묶음
// - GamesContext: 리스트 전용(게임 배열)
// - PaginationContext: 푸터/페이지네이션 전용 상태

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { GamesRow } from '@/types/database.table.types'

/** 리스트 전용 컨텍스트 */
export type GamesValue = Readonly<{ games: readonly GamesRow[] }>
const GamesContext = createContext<GamesValue | null>(null)

export const useGamesList = (): GamesValue => {
  const v = useContext(GamesContext)
  if (!v) throw new Error('useGamesList must be used within GamesProvider')
  return v
}

export function GamesProvider({ value, children }: { value: GamesValue; children: ReactNode }) {
  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

/** 푸터/페이지네이션 전용 컨텍스트 */
export type PaginationValue = {
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
}
const PaginationContext = createContext<PaginationValue | null>(null)

export const usePagination = (): PaginationValue => {
  const v = useContext(PaginationContext)
  if (!v) throw new Error('usePagination must be used within PaginationProvider')
  return v
}

export function PaginationProvider({
  value,
  children,
}: {
  value: PaginationValue
  children: ReactNode
}) {
  return <PaginationContext.Provider value={value}>{children}</PaginationContext.Provider>
}
