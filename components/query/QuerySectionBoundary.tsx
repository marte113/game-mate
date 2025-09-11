"use client"

import { ReactNode, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import ClientErrorBoundary from "@/components/error/ClientErrorBoundary"
import ErrorView from "@/components/feedback/ErrorView"
import type { QueryKey as AppQueryKey } from "@/constants/queryKeys"

export interface QuerySectionBoundaryProps {
  children: ReactNode
  keys: AppQueryKey | AppQueryKey[]
  title?: string
  message?: string
  hint?: ReactNode
  /**
   * hint 표시 여부. 기본값은 개발 환경에서만 true, 프로덕션에서는 false
   */
  showHint?: boolean
}

/**
 * React Query 섹션 전용 에러 바운더리
 * - useErrorBoundary: true인 쿼리 에러를 포착
 * - 재시도 시 해당 queryKey들을 invalidate → refetch
 */
export default function QuerySectionBoundary({
  children,
  keys,
  title = "데이터를 불러오는 중 문제가 발생했어요",
  message = "네트워크 상태를 확인하시고 다시 시도해 주세요.",
  hint,
  showHint,
}: QuerySectionBoundaryProps) {
  const queryClient = useQueryClient()
  const keysArray = Array.isArray(keys) ? keys : [keys]
  // resetKeys는 참조 동등성 문제를 피하기 위해 직렬화된 문자열을 사용
  const resetKey = JSON.stringify(keysArray)
  // 프로덕션에서는 기본적으로 hint를 숨김
  const resolvedShowHint = showHint ?? process.env.NODE_ENV !== "production"

  const handleRetry = useCallback(() => {
    // 관련 쿼리 무효화 → 재요청
    for (const key of keysArray) {
      // TanStack QueryKey 형태로 캐스팅하여 사용
      void queryClient.invalidateQueries({
        queryKey: key as unknown as readonly unknown[],
        exact: false,
      })
    }
  }, [keysArray, queryClient])

  return (
    <ClientErrorBoundary
      resetKeys={[resetKey]}
      fallbackRender={({ error, reset }) => {
        const displayMessage =
          process.env.NODE_ENV === "production" ? message : error?.message || message
        return (
          <ErrorView
            title={title}
            message={displayMessage}
            hint={resolvedShowHint ? hint : undefined}
            onRetry={() => {
              handleRetry()
              reset()
            }}
          />
        )
      }}
    >
      {children}
    </ClientErrorBoundary>
  )
}
